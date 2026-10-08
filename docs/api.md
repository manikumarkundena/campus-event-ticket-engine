# REST API Specification Document

**Project:** Campus Event Ticketing Engine  
**Course:** Activity Based Learning – 1 (Siddaganga Institute of Technology, Tumakuru)  
**Base URL:** `http://localhost:5000/api` (Production: `https://campus-events.sit.ac.in/api`)  

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register Student Account
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Raghavendra Rao",
  "email": "student@sit.ac.in",
  "password": "Password123!",
  "role": "STUDENT",
  "department": "Computer Science & Engineering",
  "usn": "1SI22CS101"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Account registered successfully",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "student@sit.ac.in",
      "name": "Raghavendra Rao",
      "role": "STUDENT",
      "department": "Computer Science & Engineering",
      "usn": "1SI22CS101"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### 1.2 User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "student@sit.ac.in",
  "password": "Password123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "email": "...", "role": "STUDENT", "name": "..." },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### 1.3 Get Current Profile
- **Endpoint:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** Returns logged-in user profile, department, and booking counters.

---

## 2. Event Endpoints (`/api/events`)

### 2.1 List Published Events (Catalog)
- **Endpoint:** `GET /api/events`
- **Query Parameters:**
  - `search` (string, optional)
  - `category` (TECHNICAL | CULTURAL | SPORTS | WORKSHOP | HACKATHON)
  - `page` (number, default: 1)
  - `limit` (number, default: 12)
- **Response (200 OK):** Array of campus events with live remaining capacities and organizer info.

### 2.2 Get Event Details
- **Endpoint:** `GET /api/events/:id`
- **Response (200 OK):** Complete event details, schedule, venue, and live capacity counters.

### 2.3 Create Event
- **Endpoint:** `POST /api/events`
- **Access:** `ORGANIZER` or `ADMIN`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "title": "SIT TECHHACK 2026: 36-Hour Hackathon",
  "description": "Annual flagship hackathon at SIT...",
  "category": "HACKATHON",
  "venue": "CS/IS Labs, SIT Campus",
  "startDateTime": "2026-10-15T09:00:00.000Z",
  "endDateTime": "2026-10-16T21:00:00.000Z",
  "totalCapacity": 120,
  "bannerUrl": "https://..."
}
```
- **Response (201 Created):** Created event object with `availableCapacity` initialized to `totalCapacity`.

### 2.4 Organizer Dashboard Analytics
- **Endpoint:** `GET /api/events/organizer/dashboard`
- **Access:** `ORGANIZER` or `ADMIN`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalEvents": 5,
    "upcomingEvents": 4,
    "totalBookings": 142,
    "totalCapacity": 750,
    "totalValidatedTickets": 38,
    "validationRate": 27,
    "capacityFillRate": 19,
    "eventsSummary": [...]
  }
}
```

---

## 3. Booking & Ticketing Endpoints (`/api/bookings`)

### 3.1 Reserve Ticket Pass (Atomic Transaction)
- **Endpoint:** `POST /api/bookings`
- **Access:** Authenticated User
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "eventId": "e2478574-fafe-4a17-bb48-a4c4fd252659"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Ticket booked successfully",
  "data": {
    "booking": {
      "id": "b59896ec-737a-4154-810e-5ea28412792a",
      "bookingReference": "BK-TECHHACK-001",
      "status": "CONFIRMED"
    },
    "ticket": {
      "id": "ticket-uuid",
      "ticketCode": "TKT-SIT-TH01",
      "qrPayload": "TKT_PASS_cc43ca96fce14d529dd82957303f920d",
      "status": "VALID"
    },
    "event": {
      "title": "SIT TECHHACK 2026: 36-Hour Hackathon",
      "venue": "CS/IS Labs, SIT Campus"
    }
  }
}
```
- **Error Responses:**
  - `409 Conflict`: "You have already reserved a ticket for this event"
  - `409 Conflict`: "Event has reached maximum capacity. No remaining tickets."

### 3.2 Get User Bookings & Passes
- **Endpoint:** `GET /api/bookings/my`
- **Access:** Authenticated User
- **Response (200 OK):** Array of user's active bookings, digital tickets, and event metadata.

---

## 4. Gate Validation Endpoints (`/api/validation`)

### 4.1 Verify QR Pass / Ticket Code (Idempotent Turnstile Entry)
- **Endpoint:** `POST /api/validation/verify`
- **Access:** `GATE_STAFF`, `ORGANIZER`, or `ADMIN`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "ticketIdentifier": "TKT-SIT-TH01",
  "entryNotes": "Gate 1 Turnstile Clearance"
}
```
- **Response (200 OK - VALID):**
```json
{
  "success": true,
  "data": {
    "result": "VALID",
    "message": "Entry approved! Welcome Raghavendra Rao.",
    "ticket": {
      "id": "...",
      "ticketCode": "TKT-SIT-TH01",
      "status": "USED",
      "validatedAt": "2026-10-08T18:16:30.000Z",
      "validatedBy": "Suresh Gowda (Security Gate Lead)"
    },
    "event": { "title": "SIT TECHHACK 2026", "venue": "..." },
    "attendee": { "name": "Raghavendra Rao", "usn": "1SI22CS101", "department": "CSE" }
  }
}
```
- **Response (200 OK - ALREADY USED):**
```json
{
  "success": true,
  "data": {
    "result": "ALREADY_USED",
    "message": "Duplicate entry blocked! This ticket was already verified at 6:16:30 pm by Suresh Gowda.",
    "ticket": { "status": "USED", "validatedAt": "..." }
  }
}
```

---

## 5. System Health (`/api/health`)

- **Endpoint:** `GET /api/health`
- **Access:** Public (Used by Docker & Kubernetes Liveness / Readiness Probes)
- **Response (200 OK):**
```json
{
  "status": "UP",
  "service": "campus-event-ticketing-backend",
  "institute": "Siddaganga Institute of Technology, Tumakuru",
  "project": "Campus Event Ticketing Engine (SPM ABL-1)",
  "version": "1.0.0",
  "uptimeSeconds": 2420,
  "components": {
    "database": { "status": "healthy", "latencyMs": 4 },
    "process": { "status": "healthy", "nodeVersion": "v22.17.1", "memoryUsageMb": 12 }
  },
  "responseTimeMs": 5
}
```
