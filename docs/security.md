# Security, Reliability & Privacy Architecture

**Institution:** Siddaganga Institute of Technology, Tumakuru  
**Course:** Activity Based Learning – 1 (SPM Practical Approach using DevOps Tools)  
**Academic Micro-Project 2026–27**  

---

## 1. Security Overview & Threat Model

The **Campus Event Ticketing Engine** implements defense-in-depth principles across the presentation, API, and relational database tiers to protect collegiate identities, prevent ticket counterfeit duplication, and enforce capacity boundaries.

---

## 2. Authentication & Credential Protection

1. **Password Hashing:** Passwords are never stored in plaintext. They are salted and hashed using `bcrypt` (10 rounds).
2. **Password Sanitization:** All user query projections explicitly omit `passwordHash` to prevent accidental leakage in API payloads.
3. **Session & Token Management:** Authenticated sessions use JSON Web Tokens (JWT) signed with HMAC-SHA256 (`HS256`). Tokens carry expiration timestamps (`expiresIn: '7d'`) and non-sensitive claims (`userId`, `role`, `email`, `name`).
4. **Zero Hardcoded Secrets:** Secret keys, database connection strings, and registry credentials are read exclusively from environment variables (`.env`).

---

## 3. Role-Based Access Control (RBAC) Matrix

Server-side authorization is strictly enforced via `requireRole` middleware. Frontend UI elements reflect permissions for convenience, but the API rejects unauthorized requests with HTTP `403 Forbidden`.

| Resource / Endpoint | `STUDENT` | `ORGANIZER` | `GATE_STAFF` | `ADMIN` |
|---|:---:|:---:|:---:|:---:|
| `POST /api/auth/register` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/events` (Catalog) | ✅ | ✅ | ✅ | ✅ |
| `POST /api/events` (Create Event) | ❌ | ✅ | ❌ | ✅ |
| `PUT /api/events/:id` (Edit Event) | ❌ | ✅ (Own) | ❌ | ✅ |
| `DELETE /api/events/:id` (Cancel) | ❌ | ✅ (Own) | ❌ | ✅ |
| `GET /api/events/organizer/dashboard` | ❌ | ✅ | ❌ | ✅ |
| `POST /api/bookings` (Reserve Pass) | ✅ | ✅ | ✅ | ✅ |
| `GET /api/bookings/my` (User Passes)| ✅ | ✅ | ✅ | ✅ |
| `POST /api/validation/verify` | ❌ | ✅ | ✅ | ✅ |
| `GET /api/admin/users` | ❌ | ❌ | ❌ | ✅ |
| `PUT /api/admin/users/:id/role` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/admin/audit` | ❌ | ❌ | ❌ | ✅ |

---

## 4. Privacy & QR Code Payload Safety

In accordance with academic privacy guidelines and Section 17 & 24 of the specification:
- **Zero Personal Data in QR Codes:** QR codes do **NOT** encode student USNs, email addresses, phone numbers, or passwords.
- **Opaque Cryptographic Tokens:** QR payloads contain an unguessable 32-character opaque hex token (`TKT_PASS_<uuid>`).
- **Server-Side Validation:** Only authorized gate staff with valid session tokens can query the backend validation engine to resolve the token to an attendee name and grant turnstile clearance.

---

## 5. Audit Logging Architecture

Significant system actions produce immutable records in the `AuditLog` table:
- `USER_LOGIN`
- `USER_REGISTER`
- `EVENT_CREATE`
- `EVENT_UPDATE`
- `EVENT_CANCEL`
- `BOOKING_CREATE`
- `BOOKING_CANCEL`
- `TICKET_VALIDATED_SUCCESS`
- `TICKET_DUPLICATE_ENTRY_ATTEMPT`
- `ROLE_CHANGE`

Audit records include operator ID, target entity, timestamp, IP address, and sanitized metadata (excluding credentials).
