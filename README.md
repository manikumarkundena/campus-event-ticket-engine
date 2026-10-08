# Campus Event Ticketing Engine

[![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-v14.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.6-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-v5.22-darkblue.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326ce5.svg)](https://kubernetes.io/)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-red.svg)](https://www.jenkins.io/)
[![Tests](https://img.shields.io/badge/Tests-23%2F23%20Passed-brightgreen.svg)]()

> **Academic Project:** Activity Based Learning – 1 (ABL-1)  
> **Course:** Software Project Management: Practical Approach using DevOps Tools  
> **Institution:** Siddaganga Institute of Technology, Tumakuru  
> **Academic Year:** 2026–27  

---

## 1. Project Overview & Problem Statement

Collegiate event management frequently suffers from fragmented paperwork, physical queue congestion, ticket counterfeiting, and catastrophic ticket overselling caused by database race conditions during registration rushes.

**Campus Event Ticketing Engine** is a portfolio-quality, production-ready full-stack web application that digitizes the complete event lifecycle:

$$\text{Event Creation} \longrightarrow \text{Publication} \longrightarrow \text{Discovery} \longrightarrow \text{Student Registration} \longrightarrow \text{Capacity Verification} \longrightarrow \text{Booking} \longrightarrow \text{Digital Pass} \longrightarrow \text{Gate QR Validation} \longrightarrow \text{Entry Recording}$$

### Core Distinguishing Highlights
- **100% ACID Concurrency Safety:** Guarantees zero overselling when multiple students contend for the final remaining seat simultaneously.
- **Apple Wallet-Style Holographic Passes:** Generates SVG QR codes backed by secure opaque cryptographic tokens.
- **Sensory Gate Scanner:** Dedicated mobile-first gate turnstile terminal with audio feedback and duplicate entry blocking.
- **Four Distinct Role Portals:** Full server-side Role-Based Access Control (RBAC) for Students, Organizers, Gate Staff, and Administrators.
- **Complete DevOps Ecosystem:** Multi-stage Dockerfiles, Docker Compose, Kubernetes manifests, and a 10-stage declarative Jenkins pipeline.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Three.js (3D Hologram Hero), Lucide Icons, Canvas Confetti, `qrcode.react` |
| **Backend API** | Node.js, Express, TypeScript, Zod Schema Validation, Bcrypt, JSON Web Tokens (JWT) |
| **Data & ORM** | Prisma ORM, PostgreSQL (Production & Docker) / SQLite (Rapid Local Dev) |
| **DevOps & CI/CD** | Git, GitHub, Jenkins Pipeline, Docker (Multi-stage Alpine), Docker Compose, Kubernetes (K8s) |
| **Testing** | Jest, Supertest, ts-jest (23 automated unit, integration, RBAC, and concurrency tests) |

---

## 3. Project Directory Structure

```
Campus-Event-Ticketing-Engine/
│
├── frontend/                     # Next.js 14 Web Application
│   ├── src/
│   │   ├── app/                  # App Router pages (/events, /dashboard, /gate/validate, etc.)
│   │   ├── components/           # Reusable UI, 3D Hero, Digital Pass, EventCard
│   │   ├── context/              # AuthContext & Session Provider
│   │   ├── lib/                  # API client & formatting utilities
│   │   └── types/                # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                      # Express REST API Server
│   ├── src/
│   │   ├── controllers/          # Request handlers (Auth, Event, Booking, Validation, Admin)
│   │   ├── middleware/           # JWT authentication, RBAC, errorHandler, Zod validate
│   │   ├── routes/               # API route definitions (/api/*)
│   │   ├── services/             # Core business logic & transactional booking engine
│   │   ├── utils/                # Prisma client, JWT, password hashing, audit logger
│   │   ├── validators/           # Zod payload validation schemas
│   │   └── index.ts              # Server bootstrap & graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma         # Local SQLite schema
│   │   ├── schema.postgresql.prisma # Production PostgreSQL schema
│   │   └── seed.ts               # Demo data seeder (4 roles, 5 SIT campus events)
│   ├── tests/                    # 23 automated Jest & Supertest tests
│   └── package.json
│
├── docker/                       # Multi-stage production container configurations
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
│
├── k8s/                          # Production Kubernetes deployment manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   └── ingress.yaml
│
├── docs/                         # Academic project documentation (ABL-1)
│   ├── architecture.md           # SDS with 6 comprehensive Mermaid diagrams
│   ├── database-design.md        # 3NF ERD, indexing, and transactional locking
│   ├── api.md                    # REST API endpoint specifications
│   ├── testing.md                # QA report (23/23 tests, concurrency race condition)
│   ├── deployment.md             # Docker, Kubernetes & Jenkins guides
│   ├── security.md               # RBAC matrix, OWASP Top 10, privacy
│   ├── ai-development-log.md     # Responsible AI development log
│   ├── git-workflow.md           # GitFlow branching & commit conventions
│   └── evidence-checklist.md     # Honest 30-item evidence tracking matrix
│
├── scripts/                      # Automation & verification scripts
│   ├── e2e-demo-flow.js          # Automated 10-step lifecycle simulation
│   └── verify-routes.js          # HTTP route verification script
│
├── Jenkinsfile                   # Multi-stage declarative CI/CD pipeline
├── docker-compose.yml            # Multi-container orchestration (Frontend, Backend, DB)
├── .env.example                  # Environment variable template
├── .gitignore
└── README.md
```

---

## 4. Quick Start (Run Locally in 2 Minutes)

### Prerequisites
- Node.js v20+ or v22+
- npm v10+

### Step 1: Start Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run build
npm start
```
*Backend active at `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)*

### Step 2: Start Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run build
npm start
```
*Frontend live at `http://localhost:3000`*

---

## 5. Pre-Seeded Demo Credentials

The database comes pre-seeded with fictional accounts for live evaluation:

| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `student@sit.ac.in` | `Password123!` | Raghavendra Rao (1SI22CS101, CSE) |
| **Organizer** | `organizer@sit.ac.in` | `Password123!` | Prof. Kiran Kumar (IEEE Student Branch Counselor) |
| **Gate Staff**| `gate@sit.ac.in` | `Password123!` | Suresh Gowda (Security Gate Lead) |
| **Admin** | `admin@sit.ac.in` | `Password123!` | Dr. Siddalingaiah (Dean Student Welfare) |

> 💡 **Presentation Tip:** The web application includes an **Instant Demo Role Switcher** dropdown in the top navbar and login page. Evaluators can switch between all 4 roles with a single click without manually typing credentials!

---

## 6. Automated Testing & Concurrency Verification

Run the automated test suite:
```bash
cd backend
npm test
```

### Verified Output:
```
Test Suites: 5 passed, 5 total
Tests:       23 passed, 23 total
Time:        43.023 s
```

### Critical Concurrency Race-Condition Verification
To prove zero overselling under race conditions, `tests/booking-concurrency.test.ts` creates an event with **1 seat available** and dispatches **10 simultaneous requests** in parallel at the exact same millisecond:
- **1 request succeeded (201 Created)**
- **9 requests rejected (409 Conflict)**
- **Database available capacity remained strictly 0 (no overselling)**

### Automated E2E Lifecycle Demo Simulation
Run the complete 10-step academic workflow simulation:
```bash
node scripts/e2e-demo-flow.js
```
*Verifies: Health -> Organizer Login -> Event Creation -> Student Login -> Ticket Booking -> Duplicate Prevention -> Gate Login -> Gate Clearance -> Duplicate Re-entry Blocked -> Organizer Analytics Update.*

---

## 7. Docker & Kubernetes Deployment

### Run with Docker Compose
```bash
docker compose up -d --build
```

### Deploy to Kubernetes
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml
```

---

## 8. Academic Credits

- **Course:** Activity Based Learning – 1 (SPM Practical Approach using DevOps Tools)
- **Institution:** Siddaganga Institute of Technology, Tumakuru
- **Academic Year:** 2026–27
