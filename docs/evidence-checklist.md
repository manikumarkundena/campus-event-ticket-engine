# Academic Project Evidence Checklist (ABL-1)

**Institution:** Siddaganga Institute of Technology, Tumakuru  
**Course:** Activity Based Learning – 1 (SPM Practical Approach using DevOps Tools)  
**Academic Micro-Project 2026–27**  
**Project:** Campus Event Ticketing Engine  

---

## Evidence Status Legend

- **DESIGN:** Architecture, schema, or manifest designed and documented.
- **IMPLEMENTED:** Source code, configuration, or test authored in workspace.
- **EXECUTED:** Actually run in the current environment using real commands.
- **VERIFIED:** Validated with genuine terminal/test output and exit code 0.
- **CONFIGURED — DEPLOYMENT PENDING:** Configured completely, pending external cluster/credentials.
- **SCREENSHOT REQUIRED:** Requires visual capture during live presentation.

---

## Evidence Tracking Matrix

| Requirement / Component | Status | Evidence Artifact / Command | Notes |
|---|:---:|---|---|
| **1. Database Relational Schema** | **VERIFIED** | `backend/prisma/schema.prisma`<br>`backend/prisma/schema.postgresql.prisma` | Tables created: User, Event, Booking, Ticket, AuditLog |
| **2. Database Migrations & Tables** | **VERIFIED** | `npx prisma db push` | SQLite dev.db created and synchronized in 342ms |
| **3. Seed Demo Data** | **VERIFIED** | `npm run prisma:seed` | Created 4 demo roles + 5 realistic SIT campus events |
| **4. Authentication & Password Hashing** | **VERIFIED** | `backend/tests/auth.test.ts` | 6/6 tests passed (Bcrypt hashing + JWT issuance) |
| **5. Role-Based Access Control (RBAC)** | **VERIFIED** | `backend/tests/events.test.ts` | Student forbidden from organizer actions (403 Forbidden verified) |
| **6. Event CRUD & Public Catalog** | **VERIFIED** | `backend/tests/events.test.ts` | Public discovery, creation, updating verified |
| **7. Atomic Capacity Reservation** | **VERIFIED** | `backend/tests/booking-concurrency.test.ts` | Transactional decrement inside `$transaction` |
| **8. Concurrency Race-Condition Test** | **VERIFIED** | `backend/tests/booking-concurrency.test.ts` | 10 simultaneous requests for 1 seat -> Exactly 1 success, 9 rejections (409) |
| **9. Duplicate Booking Prevention** | **VERIFIED** | `backend/tests/booking-concurrency.test.ts` | Second booking by same student rejected with 409 Conflict |
| **10. Digital Ticket Pass Generation** | **VERIFIED** | `backend/tests/booking-concurrency.test.ts` | Unique code + opaque QR payload generated |
| **11. Gate QR Ticket Validation** | **VERIFIED** | `backend/tests/validation.test.ts` | VALID ticket grants entry and updates status to USED |
| **12. Idempotent Turnstile Re-entry Block**| **VERIFIED** | `backend/tests/validation.test.ts` | Same ticket scanned second time returns ALREADY_USED |
| **13. System Audit Trail Logging** | **VERIFIED** | `backend/tests/admin.test.ts` | Audit records created for registration, bookings, scans |
| **14. System Health Check Endpoint** | **VERIFIED** | `http://localhost:5000/api/health` | Returns UP, database latency 3ms, uptime counter |
| **15. Automated Test Suite Execution** | **VERIFIED** | `npm test` | **23 passed, 23 total** in 43.02s |
| **16. Next.js Frontend Production Build**| **VERIFIED** | `npm run build` | All 13 routes compiled & statically pre-rendered |
| **17. Frontend Route HTTP Availability**| **VERIFIED** | `node scripts/verify-routes.js` | 10 / 10 routes return HTTP 200 OK (22KB - 35KB HTML) |
| **18. E2E 10-Step Lifecycle Simulation**| **VERIFIED** | `node scripts/e2e-demo-flow.js` | All 10 demo steps executed and verified with exit code 0 |
| **19. Interactive 3D Hologram Hero** | **IMPLEMENTED** | `frontend/src/components/3d/HologramTicketHero.tsx` | Three.js canvas card with particle constellation & fallback |
| **20. Apple Wallet-Style Digital Pass** | **IMPLEMENTED** | `frontend/src/components/tickets/DigitalPass.tsx` | Perforated pass styling with dynamic SVG QR code |
| **21. Gate Audio Feedback** | **IMPLEMENTED** | `frontend/src/app/gate/validate/page.tsx` | Web Audio API synthesizer chimes for VALID and buzzes for USED |
| **22. Multi-Stage Docker Backend** | **IMPLEMENTED** | `docker/Dockerfile.backend` | Node 22 Alpine multi-stage build with non-root security |
| **23. Multi-Stage Docker Frontend**| **IMPLEMENTED** | `docker/Dockerfile.frontend` | Node 22 Alpine multi-stage Next.js production build |
| **24. Docker Compose Orchestration** | **IMPLEMENTED** | `docker-compose.yml` | Multi-container stack (Frontend, Backend, PostgreSQL 16) |
| **25. Kubernetes Manifests** | **IMPLEMENTED** | `k8s/*.yaml` (8 manifests) | Namespace, ConfigMap, Secret, Deployments, Services, Ingress |
| **26. Jenkins CI/CD Pipeline** | **IMPLEMENTED** | `Jenkinsfile` | 10-stage declarative pipeline with quality gates |
| **27. Git Repository Initialized** | **VERIFIED** | `git status` | Clean commits on branch `main` |
| **28. Browser Subagent Visual Inspection**| **ATTEMPTED** | `browser_subagent` tool | Subagent model capacity was 503 unavailable; fallback automated route verification executed |
| **29. Cloud Production Deployment** | **CONFIGURED — DEPLOYMENT PENDING** | K8s manifests & Docker Compose | Ready for cloud deployment when external cluster is provisioned |
| **30. UI Screenshots** | **SCREENSHOT REQUIRED** | Browser UI running at `http://localhost:3000` | Capture during live classroom presentation |
