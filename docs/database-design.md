# Database & Relational Data Design Document

**Institution:** Siddaganga Institute of Technology, Tumakuru  
**Course:** Activity Based Learning – 1 (SPM Practical Approach using DevOps Tools)  
**Academic Micro-Project 2026–27**  

---

## 1. Relational Schema Architecture

The database architecture is designed with strict Third Normal Form (3NF) relational principles, enforce foreign key integrity, non-nullable operational constraints, and database-level unique indexes to guarantee data correctness under high concurrent loads.

```
+-----------------------------------------------------------------------------------------+
|                                    DATABASE SCHEMAS                                     |
+-----------------------------------------------------------------------------------------+
|  USERS                                                                                  |
|  - id (UUID, PK)                                                                        |
|  - email (VARCHAR, UNIQUE)                                                              |
|  - passwordHash (VARCHAR)                                                               |
|  - name (VARCHAR)                                                                       |
|  - role (ENUM: STUDENT | ORGANIZER | ADMIN | GATE_STAFF)                                |
|  - department (VARCHAR, NULLABLE)                                                       |
|  - usn (VARCHAR, UNIQUE, NULLABLE)                                                      |
+-----------------------------------------------------------------------------------------+
       |                                      |
       | 1:N (organizerId)                    | 1:N (userId)
       v                                      v
+-------------------------------+      +--------------------------------------------------+
|  EVENTS                       |      |  BOOKINGS                                        |
|  - id (UUID, PK)              |      |  - id (UUID, PK)                                 |
|  - title (VARCHAR)            |      |  - bookingReference (VARCHAR, UNIQUE)            |
|  - description (TEXT)         |      |  - userId (UUID, FK -> Users.id)                 |
|  - category (ENUM)            |      |  - eventId (UUID, FK -> Events.id)               |
|  - venue (VARCHAR)            |      |  - status (ENUM: CONFIRMED | CANCELLED)          |
|  - startDateTime (DATETIME)   |      |  - createdAt (DATETIME)                          |
|  - endDateTime (DATETIME)     |      |  UNIQUE CONSTRAINT: (userId, eventId)            |
|  - totalCapacity (INT)        |      +--------------------------------------------------+
|  - availableCapacity (INT)    |                             |
|  - status (ENUM: PUBLISHED...)|                             | 1:1 (bookingId)
+-------------------------------+                             v
       |                               +--------------------------------------------------+
       | 1:N (eventId)                 |  TICKETS                                         |
       +------------------------------>|  - id (UUID, PK)                                 |
                                       |  - ticketCode (VARCHAR, UNIQUE)                  |
                                       |  - qrPayload (VARCHAR, UNIQUE)                   |
                                       |  - bookingId (UUID, FK -> Bookings.id, UNIQUE)   |
                                       |  - status (ENUM: VALID | USED | CANCELLED)       |
                                       |  - validatedAt (DATETIME, NULLABLE)              |
                                       |  - validatedById (UUID, FK -> Users.id, NULL)    |
                                       |  - entryNotes (TEXT, NULLABLE)                   |
                                       +--------------------------------------------------+

+-----------------------------------------------------------------------------------------+
|  AUDIT_LOGS                                                                             |
|  - id (UUID, PK)                                                                        |
|  - action (VARCHAR: USER_LOGIN, BOOKING_CREATE, TICKET_VALIDATED_SUCCESS, etc.)         |
|  - entityType (VARCHAR: USER | EVENT | BOOKING | TICKET | SYSTEM)                       |
|  - entityId (VARCHAR, NULLABLE)                                                         |
|  - userId (UUID, FK -> Users.id, NULLABLE)                                              |
|  - metadata (JSON / TEXT, NULLABLE)                                                     |
|  - ipAddress (VARCHAR, NULLABLE)                                                        |
|  - createdAt (DATETIME)                                                                 |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Concurrency & Capacity Protection Strategy

### 2.1 The Race Condition Threat
Consider a high-demand campus event with **1 remaining seat** (`availableCapacity = 1`).
Two students ($S_1$ and $S_2$) submit booking requests simultaneously at $t_0$.
In naive CRUD applications:
1. Thread 1 reads `availableCapacity = 1`.
2. Thread 2 reads `availableCapacity = 1`.
3. Thread 1 inserts Booking 1 and writes `availableCapacity = 0`.
4. Thread 2 inserts Booking 2 and writes `availableCapacity = 0`.
**Result:** 2 tickets issued for 1 seat (**Overselling / Capacity Breach**).

### 2.2 Our Atomic Mitigation (Prisma + Conditional Decrement)
We enforce atomic reservations inside a database transaction (`$transaction`):

```typescript
const capacityUpdate = await tx.event.updateMany({
  where: {
    id: eventId,
    availableCapacity: { gt: 0 },
    status: 'PUBLISHED',
  },
  data: {
    availableCapacity: { decrement: 1 },
  },
});

if (capacityUpdate.count === 0) {
  throw new AppError('Event has reached maximum capacity. No remaining tickets.', 409);
}
```

**Why this is guaranteed safe:**
1. The SQL engine executes conditional updates atomically with row-level locks:
   $$\text{UPDATE Event SET availableCapacity = availableCapacity - 1 WHERE id = :id AND availableCapacity > 0 AND status = 'PUBLISHED'}$$
2. If two concurrent threads execute this statement, the database serializes the row write. The first thread decrements $1 \to 0$ and receives `count = 1`.
3. The second thread evaluates `availableCapacity > 0` which is now `FALSE`, returning `count = 0`.
4. The application catches `count === 0`, throws an `AppError(409)`, and automatically **ROLLS BACK** the transaction.
5. No orphan booking or ticket is ever created.

---

## 3. Duplicate Booking Prevention

Duplicate bookings are blocked at **both layers**:
1. **Application Layer:** Prior to capacity decrement, the transaction queries:
   ```typescript
   const existing = await tx.booking.findUnique({
     where: { userId_eventId: { userId, eventId } }
   });
   ```
2. **Database Engine Layer:** The `Booking` schema defines a composite unique constraint:
   ```prisma
   @@unique([userId, eventId])
   ```
   Even if simultaneous requests bypass application checks, the database raises a unique key constraint violation (`SQLITE_CONSTRAINT_UNIQUE` / Postgres `23505`), preventing duplicate records.

---

## 4. Database Indexing Strategy

To maintain sub-15ms response times under campus peak traffic:

| Table | Index Columns | Index Type | Purpose |
|---|---|---|---|
| `User` | `email` | B-Tree Unique | Rapid authentication lookup |
| `User` | `usn` | B-Tree Unique | College seat number validation |
| `User` | `role` | B-Tree Non-unique | Filter by role (Admin queries) |
| `Event` | `status` | B-Tree Non-unique | Public discovery (`status = 'PUBLISHED'`) |
| `Event` | `category` | B-Tree Non-unique | Filtering by Technical, Cultural, etc. |
| `Event` | `startDateTime` | B-Tree Non-unique | Chronological sorting of upcoming events |
| `Booking` | `bookingReference` | B-Tree Unique | Rapid reference lookup |
| `Booking` | `[userId, eventId]` | Composite Unique | Duplicate booking prevention |
| `Ticket` | `ticketCode` | B-Tree Unique | Gate manual code entry lookup |
| `Ticket` | `qrPayload` | B-Tree Unique | Gate fast QR scanner token resolution |
| `Ticket` | `status` | B-Tree Non-unique | Filtering VALID vs USED tickets |
| `AuditLog` | `action, createdAt`| B-Tree Non-unique | Security incident investigation |
