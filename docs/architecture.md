# Campus Event Ticketing Engine — System Architecture Document (SDS)

**Institution:** Siddaganga Institute of Technology, Tumakuru  
**Department:** Information Science & Engineering  
**Course:** Activity Based Learning – 1 (Software Project Management: Practical Approach using DevOps Tools)  
**Academic Year:** 2026–27  
**Project:** Campus Event Ticketing Engine  

---

## 1. Executive Architecture Summary

The **Campus Event Ticketing Engine** is an enterprise-grade, concurrency-safe web application designed to manage the complete lifecycle of campus events:

$$\text{Creation} \longrightarrow \text{Publication} \longrightarrow \text{Discovery} \longrightarrow \text{Registration} \longrightarrow \text{Capacity Verification} \longrightarrow \text{Booking} \longrightarrow \text{Digital Pass} \longrightarrow \text{Gate QR Validation} \longrightarrow \text{Audit Logging}$$

The application is structured as a **clean modular multi-tier architecture** with strict boundary separation between client-side presentation, API gateway & business logic, relational ACID storage, and automated DevOps delivery pipelines.

---

## 2. System Architecture Diagram

```mermaid
graph TB
    subgraph ClientLayer["Presentation Tier (Next.js 14 / TypeScript)"]
        Landing["Landing Page (3D Hologram Hero)"]
        Catalog["Event Discovery Catalog"]
        StudentPortal["Student Dashboard & My Passes"]
        PassView["Apple Wallet-Style Digital Pass (QR SVG)"]
        OrgStudio["Organizer Analytics Studio"]
        GateTerminal["Gate Security Turnstile Scanner"]
        AdminConsole["Admin Operations & Audit Console"]
    end

    subgraph ApiLayer["Application & Business Logic Tier (Node.js / Express / TypeScript)"]
        Router["Express REST API Router (/api)"]
        AuthMiddleware["JWT & RBAC Middleware (Role Guard)"]
        ZodValidator["Zod Input Validation Engine"]
        
        subgraph Services["Core Domain Services"]
            AuthService["Auth Service (Bcrypt + JWT)"]
            EventService["Event Lifecycle Service"]
            BookingEngine["Transactional Booking Engine (Atomic Decrement)"]
            ValidationService["Gate Turnstile Validation Service (Idempotent)"]
            AdminService["Audit Trail & User Management Service"]
        end
    end

    subgraph DataLayer["Persistence & Audit Tier (Prisma ORM)"]
        Prisma["Prisma ORM Client"]
        Database[("Relational Database (PostgreSQL / SQLite)")]
        Tables["Tables: User, Event, Booking, Ticket, AuditLog"]
    end

    subgraph DevOpsLayer["DevOps & Container Infrastructure"]
        Docker["Multi-stage Docker Containers"]
        Jenkins["Jenkins Declarative CI/CD Pipeline"]
        K8s["Kubernetes (Deployments, Services, ConfigMaps, Ingress)"]
    end

    ClientLayer -->|"HTTPS / JSON REST"| Router
    Router --> AuthMiddleware
    AuthMiddleware --> ZodValidator
    ZodValidator --> Services
    Services --> Prisma
    Prisma --> Database
    Database --- Tables
    DevOpsLayer -.->|"Orchestrates & Deploys"| ClientLayer
    DevOpsLayer -.->|"Orchestrates & Deploys"| ApiLayer
```

---

## 3. Use Case Modeling

The system implements four distinct security roles with server-side authorization:

```mermaid
flowchart LR
    Student((Student))
    Organizer((Event Organizer))
    GateStaff((Gate Security Staff))
    Admin((Administrator))

    subgraph SystemActions["Campus Event Ticketing Engine Portals"]
        UC1[Browse & Search Events]
        UC2[Reserve Ticket Pass]
        UC3[View Holographic Pass & QR Code]
        UC4[Create & Publish Events]
        UC5[AI Event Assistant Copywriting]
        UC6[Monitor Attendance & Capacity]
        UC7[Scan & Verify Attendee QR Code]
        UC8[Prevent Duplicate Re-entry]
        UC9[Manage User Roles & Permissions]
        UC10[Inspect System Audit Logs]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3

    Organizer --> UC1
    Organizer --> UC4
    Organizer --> UC5
    Organizer --> UC6

    GateStaff --> UC7
    GateStaff --> UC8

    Admin --> UC1
    Admin --> UC4
    Admin --> UC6
    Admin --> UC7
    Admin --> UC9
    Admin --> UC10
```

---

## 4. Sequence Diagram: Atomic Concurrency-Safe Booking

The booking sequence prevents capacity overselling through atomic transactions and conditional updates:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Client
    participant API as Express API Router
    participant Auth as RBAC Middleware
    participant Service as Booking Service
    participant DB as Relational DB (Prisma Transaction)

    Student->>API: POST /api/bookings { eventId } (Bearer Token)
    API->>Auth: Validate JWT & verify STUDENT role
    Auth-->>API: User Context Attached (userId, role)
    API->>Service: createBooking(userId, eventId)
    
    rect rgb(20, 30, 45)
        Note over Service,DB: BEGIN TRANSACTION (SERIALIZABLE / ACID)
        Service->>DB: Check existing booking: userId + eventId
        alt Already Booked
            DB-->>Service: Existing booking found
            Service-->>API: 409 Conflict: "Already reserved a ticket"
            API-->>Student: 409 Conflict Error
        end
        
        Service->>DB: UPDATE Event SET availableCapacity = availableCapacity - 1 WHERE id = :id AND availableCapacity > 0 AND status = 'PUBLISHED'
        alt availableCapacity == 0 (Capacity Exceeded)
            DB-->>Service: rowsUpdated = 0
            Service-->>DB: ROLLBACK TRANSACTION
            Service-->>API: 409 Conflict: "Event is completely booked"
            API-->>Student: 409 Conflict Error
        else Available Capacity Decremented
            DB-->>Service: rowsUpdated = 1
            Service->>DB: INSERT INTO Booking (bookingReference, userId, eventId, status='CONFIRMED')
            Service->>DB: INSERT INTO Ticket (ticketCode, qrPayload, bookingId, status='VALID')
            Service-->>DB: COMMIT TRANSACTION
        end
    end

    Service->>DB: INSERT INTO AuditLog (action='BOOKING_CREATE', userId, metadata)
    Service-->>API: 201 Created { booking, ticket }
    API-->>Student: JSON Confirmation + Ticket Pass Payload
```

---

## 5. Sequence Diagram: Gate Ticket Validation & Idempotent Turnstile Verification

```mermaid
sequenceDiagram
    autonumber
    actor Gate as Gate Officer (Scanner Terminal)
    participant API as Validation API Router
    participant Service as Validation Service
    participant DB as Database

    Gate->>API: POST /api/validation/verify { ticketIdentifier: "TKT-SIT-TH01" }
    API->>Service: validateTicket(ticketIdentifier, staffUserId)
    Service->>DB: Query Ticket with Booking, Event, Attendee
    
    alt Ticket Not Found
        DB-->>Service: null
        Service-->>API: Result: INVALID ("Ticket not found in system")
        API-->>Gate: ❌ Red Banner: ACCESS DENIED + Error Buzzer
    else Ticket Status == CANCELLED
        Service-->>API: Result: CANCELLED ("Event or booking cancelled")
        API-->>Gate: ❌ Red Banner: CANCELLED PASS
    else Ticket Status == USED
        Service-->>API: Result: ALREADY_USED ("Previously verified at time X")
        API-->>Gate: ⚠️ Amber Banner: DUPLICATE ENTRY BLOCKED + Warning Buzzer
    else Ticket Status == VALID
        Service->>DB: UPDATE Ticket SET status='USED', validatedAt=NOW(), validatedById=staffUserId
        Service->>DB: INSERT INTO AuditLog (action='TICKET_VALIDATED_SUCCESS')
        Service-->>API: Result: VALID ("Entry approved for Attendee")
        API-->>Gate: ✅ Green Glowing Banner: ENTRY APPROVED + Success Chime
    end
```

---

## 6. Activity Diagram: Campus Event Lifecycle

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Organizer Creates Event
    DRAFT --> PUBLISHED: Organizer Publishes Event
    PUBLISHED --> BOOKING_IN_PROGRESS: Student Initiates Reservation
    
    state CapacityCheck <<choice>>
    BOOKING_IN_PROGRESS --> CapacityCheck: Atomic Capacity Query
    CapacityCheck --> SOLDOUT: availableCapacity == 0
    CapacityCheck --> CONFIRMED: availableCapacity > 0 (Decremented)
    
    CONFIRMED --> TICKET_ISSUED: Generate QR Token & Ticket Code
    TICKET_ISSUED --> GATE_SCAN: Student Presents Pass at Turnstile
    
    state GateVerification <<choice>>
    GATE_SCAN --> GateVerification: Server-Side Validation
    GateVerification --> ENTRY_GRANTED: Ticket == VALID
    GateVerification --> ENTRY_DENIED: Ticket == ALREADY_USED / INVALID
    
    ENTRY_GRANTED --> USED: Status Updated to USED
    USED --> [*]: Attendance Recorded
    
    PUBLISHED --> CANCELLED: Organizer / Admin Cancels Event
    CANCELLED --> [*]: Bookings & Passes Invalidated
```

---

## 7. Entity Relational Model (Class / Data Architecture)

```mermaid
classDiagram
    class User {
        +String id [PK]
        +String email [Unique]
        +String passwordHash
        +String name
        +String role (STUDENT, ORGANIZER, ADMIN, GATE_STAFF)
        +String department
        +String usn [Unique]
        +DateTime createdAt
    }

    class Event {
        +String id [PK]
        +String title
        +String description
        +String category (TECHNICAL, CULTURAL, SPORTS, WORKSHOP, HACKATHON)
        +String venue
        +DateTime startDateTime
        +DateTime endDateTime
        +Int totalCapacity
        +Int availableCapacity
        +String status (DRAFT, PUBLISHED, CANCELLED, COMPLETED)
        +String organizerId [FK]
        +DateTime createdAt
    }

    class Booking {
        +String id [PK]
        +String bookingReference [Unique]
        +String userId [FK]
        +String eventId [FK]
        +String status (CONFIRMED, CANCELLED)
        +DateTime createdAt
    }

    class Ticket {
        +String id [PK]
        +String ticketCode [Unique]
        +String qrPayload [Unique]
        +String bookingId [FK, Unique]
        +String status (VALID, USED, CANCELLED)
        +DateTime validatedAt
        +String validatedById [FK]
        +String entryNotes
        +DateTime createdAt
    }

    class AuditLog {
        +String id [PK]
        +String action
        +String entityType
        +String entityId
        +String userId [FK]
        +String metadata (JSON)
        +String ipAddress
        +DateTime createdAt
    }

    User "1" --> "*" Event : organizes
    User "1" --> "*" Booking : books
    Event "1" --> "*" Booking : contains
    Booking "1" --> "1" Ticket : generates
    User "1" --> "*" Ticket : validates (Gate Staff)
    User "1" --> "*" AuditLog : initiates
```
