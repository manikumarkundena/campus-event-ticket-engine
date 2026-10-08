# Responsible AI-Assisted Development Log

**Institution:** Siddaganga Institute of Technology, Tumakuru  
**Course:** Activity Based Learning – 1 (SPM Practical Approach using DevOps Tools)  
**Academic Micro-Project 2026–27**  

---

## 1. Overview & Policy

This document logs significant AI-assisted engineering decisions, code reviews, automated validations, and modifications made during the design and construction of the **Campus Event Ticketing Engine**.

All AI-suggested implementations were subjected to rigorous developer review, type-checking, and automated test execution.

---

## 2. Engineering Decision & Review Log

| Phase / Task | AI Assistance & Suggestion | Developer Review & Critical Analysis | Validation / Test Executed | Final Decision & Outcome |
|---|---|---|---|---|
| **Phase 1: Database ORM Selection** | Suggestion to use Prisma ORM for relational mapping. | Evaluated Prisma vs pure SQL and Drizzle. Prisma provides strong TypeScript type generation and native support for transactions and migration scripts. | Executed `npx prisma generate` and `npx prisma db push`. | **Adopted.** Defined 3NF relational schemas for User, Event, Booking, Ticket, and AuditLog. |
| **Phase 2: Concurrency & Capacity Protection** | Initial suggestion used simple `findUnique` followed by `update`. | **Identified Flaw:** Classic Check-Then-Act race condition would allow capacity overselling under parallel concurrent requests. | Authored rigorous concurrency test in `tests/booking-concurrency.test.ts` spawning 10 parallel requests for 1 seat. | **Modified & Replaced:** Enforced conditional atomic SQL decrement: `UPDATE Event SET availableCapacity = availableCapacity - 1 WHERE id = :id AND availableCapacity > 0` inside `$transaction`. All 10-way tests passed with 0 overselling. |
| **Phase 3: Digital Pass & QR Payload** | Suggestion to embed attendee name and USN directly inside QR payload. | **Identified Privacy Violation:** Plaintext attendee information in QR codes allows unauthorized decoding by camera scanners without authentication. | Inspected ticket payload structure in `DigitalPass.tsx`. | **Modified & Replaced:** Replaced with secure opaque token (`TKT_PASS_<randomUUID>`). Attendee details are only resolved server-side by authenticated gate staff. |
| **Phase 4: Gate Staff Sensory Feedback** | Suggestion to load external MP3 audio assets from internet CDN. | **Identified Flaw:** External audio assets fail in offline or firewalled campus deployment environments. | Implemented and tested native Web Audio API oscillator synthesis. | **Adopted Native Synthesis:** Used browser-native `AudioContext` with pleasant frequencies for VALID and warning tones for ALREADY_USED. Zero external network dependencies. |
| **Phase 5: Automated E2E Verification** | Generated 10-step demonstration workflow in `scripts/e2e-demo-flow.js`. | **Caught Header Bug:** JavaScript object destructuring `{ headers: ..., ...options }` was overwriting `Content-Type: application/json`. | Executed script via Node.js CLI. | **Fixed & Verified:** Correctly merged headers. All 10 lifecycle steps passed with exit code 0. |
| **Phase 6: Multi-Stage Containerization** | Generated multi-stage Dockerfiles for backend and frontend. | Verified that image excludes development dependencies and runs under non-root unprivileged users (`appuser`, `nextuser`). | Inspected Dockerfile syntax and healthcheck scripts. | **Adopted.** Multi-stage Alpine builds with native Node.js health checks. |
