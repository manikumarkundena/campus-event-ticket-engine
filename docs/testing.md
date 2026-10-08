# Automated Testing & Quality Assurance Report

**Institution:** Siddaganga Institute of Technology, Tumakuru  
**Course:** Activity Based Learning – 1 (SPM Practical Approach using DevOps Tools)  
**Academic Micro-Project 2026–27**  

---

## 1. Testing Philosophy & Quality Gates

Per the engineering requirements of ABL-1, all tests are automated, executed against real in-memory/relational storage, and verifiable via automated CI scripts. **Zero fake results or fabricated passes are permitted.**

---

## 2. Test Execution Summary

```
Test Suites: 5 passed, 5 total
Tests:       23 passed, 23 total
Snapshots:   0 total
Time:        43.023 s
Execution:   PASS (Exit code 0)
```

### Test Suite Breakdown:

| Test Suite File | Domain / Focus | Tests Executed | Tests Passed | Status |
|---|---|:---:|:---:|:---:|
| `tests/auth.test.ts` | Student Registration, Password Hashing, JWT Issuance, Duplicate Prevention, RBAC | 6 | 6 | **PASS** |
| `tests/events.test.ts` | Event Creation, Update, Public Catalog Query, Organizer RBAC Guards | 5 | 5 | **PASS** |
| `tests/booking-concurrency.test.ts` | ACID Transactions, Capacity Decrement, Duplicate Prevention, Concurrency Race Condition | 3 | 3 | **PASS** |
| `tests/validation.test.ts` | Gate QR Verification, Idempotency, Already-Used Rejection, Gate RBAC Guards | 4 | 4 | **PASS** |
| `tests/admin.test.ts` | User Role Modification, System Metrics, Audit Log Inspection, Health Endpoint | 5 | 5 | **PASS** |
| **Total Automated Tests** | | **23** | **23** | **100% PASS** |

---

## 3. Critical Concurrency Race-Condition Verification

### 3.1 Scenario
- Event initialized with strictly **1 available seat** (`totalCapacity = 1`, `availableCapacity = 1`).
- **10 distinct student accounts** dispatch simultaneous booking requests at the exact same millisecond via `Promise.all()`.

### 3.2 Expected Behavior
1. Exactly **1 request** receives HTTP 201 Created and generates a valid ticket pass.
2. Exactly **9 requests** receive HTTP 409 Conflict ("Event has reached maximum capacity").
3. Database `availableCapacity` remains strictly **0** (no negative capacity, no overselling).
4. Exactly **1 booking** and **1 ticket** exist in the database for the event.

### 3.3 Actual Executed Result
```
PASS tests/booking-concurrency.test.ts
  Booking Integrity & Concurrency Race Condition Suite
    √ Normal booking flow: student reserves ticket, capacity decrements, valid ticket generated (136 ms)
    √ Duplicate Booking Prevention: student cannot book the same event twice (169 ms)
    √ CRITICAL CONCURRENCY RACE CONDITION: Exactly 1 ticket remaining, 10 simultaneous bookings -> Exactly 1 success, 9 rejections, capacity == 0 (422 ms)
```
- **Observed Successful Bookings:** 1
- **Observed Rejected Bookings:** 9
- **Final Database Available Capacity:** 0
- **Final Database Booking Count:** 1
- **Result:** **PASSED WITH ZERO OVERSOLD TICKETS.**

---

## 4. End-to-End (E2E) 10-Step Simulation Verification

Executed via `node scripts/e2e-demo-flow.js`:

```
============================================================
🚀 CAMPUS EVENT TICKETING ENGINE — E2E DEMO SIMULATION
   Siddaganga Institute of Technology, Tumakuru (SPM ABL-1)
============================================================

1️⃣ Checking System Health...
   ✅ System UP | Database: healthy (0ms)

2️⃣ Authenticating as Event Organizer (Prof. Kiran Kumar)...
   ✅ Organizer Authenticated | Role: ORGANIZER

3️⃣ Creating & Publishing New Campus Event...
   ✅ Event Created: "SIT Quantum Computing & DevOps Summit"
      Capacity: 3 seats

4️⃣ Authenticating as Student (Raghavendra Rao)...
   ✅ Student Authenticated | USN: 1SI22CS101

5️⃣ Student Booking Ticket Pass (Atomic Transaction)...
   ✅ Ticket Reserved Successfully!
      Booking Ref: BK-MUZJ6199-48I6
      Ticket Code: TKT-1AMV-JOPY
      QR Payload:  TKT_PASS_cc43ca96fce14d529dd82957303f920d

6️⃣ Testing Duplicate Booking Prevention (Same Student, Same Event)...
   ✅ Duplicate Request Response: HTTP 409 (Expected 409 Conflict)
      Server Message: "You have already reserved a ticket for this event"

7️⃣ Authenticating as Gate Staff (Suresh Gowda)...
   ✅ Gate Staff Authenticated | Terminal: Security Turnstile Gate 1

8️⃣ Gate Scan #1: Presenting Ticket QR Payload...
   ✅ Gate Result: [VALID]
      Message:  "Entry approved! Welcome Raghavendra Rao."
      Attendee: Raghavendra Rao (1SI22CS101)

9️⃣ Gate Scan #2: Attempting Duplicate Re-entry with Same Ticket...
   ✅ Gate Result: [ALREADY_USED]
      Message:  "Duplicate entry blocked! This ticket was already verified at 6:16:30 pm by Suresh Gowda."

🔟 Checking Organizer Dashboard Analytics Update...
   ✅ Real-time Metrics Confirmed:
      Booked Registrations: 1 / 3
      Gate Validated Entries: 1
      Total Organizer Bookings: 4

============================================================
🎉 10/10 DEMONSTRATION LIFECYCLE STEPS EXECUTED & VERIFIED
============================================================
```

---

## 5. Frontend Route Availability Verification

Executed via `node scripts/verify-routes.js`:

```
✅ [200 OK] /                         (35,352 bytes HTML rendered)
✅ [200 OK] /events                   (25,105 bytes HTML rendered)
✅ [200 OK] /login                    (26,742 bytes HTML rendered)
✅ [200 OK] /register                 (27,840 bytes HTML rendered)
✅ [200 OK] /dashboard                (24,834 bytes HTML rendered)
✅ [200 OK] /my-bookings              (22,112 bytes HTML rendered)
✅ [200 OK] /organizer/dashboard      (25,220 bytes HTML rendered)
✅ [200 OK] /organizer/events/new     (28,334 bytes HTML rendered)
✅ [200 OK] /gate/validate            (28,162 bytes HTML rendered)
✅ [200 OK] /admin/dashboard          (26,672 bytes HTML rendered)

🎯 Summary: 10 / 10 pages verified successfully.
```
