# Git Branching & Collaboration Workflow

**Institution:** Siddaganga Institute of Technology, Tumakuru  
**Course:** Activity Based Learning – 1 (SPM Practical Approach using DevOps Tools)  
**Academic Micro-Project 2026–27**  

---

## 1. Branching Strategy (GitFlow Adaptation)

The repository follows standard software engineering branching conventions:

```
main (Production-ready releases)
  │
  ├── develop (Integration branch for completed features)
  │     │
  │     ├── feature/auth-rbac (Authentication & RBAC implementation)
  │     ├── feature/transactional-booking (Capacity-safe booking engine)
  │     ├── feature/hologram-pass (Digital pass & QR generation)
  │     ├── feature/gate-scanner (Gate turnstile validation interface)
  │     └── feature/devops-ci-cd (Docker, Jenkins, Kubernetes manifests)
  │
  └── release/v1.0.0 (Release preparation & final quality gates)
```

### Branch Types:
- `main`: Reflects production-ready code. Every commit must pass all CI/CD pipelines.
- `develop`: Integration branch where tested features are merged.
- `feature/*`: Dedicated branches for distinct functional requirements (e.g., `feature/capacity-lock`).
- `fix/*`: Patches for bug fixes identified during test execution.
- `release/*`: Tagged versions prepared for final academic submission and grading.

---

## 2. Commit Message Conventions (Conventional Commits)

All commits adhere to the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification:

$$\text{<type>(<scope>): <short description>}$$

### Types:
- `feat`: A new user-facing feature (e.g., `feat(booking): implement atomic capacity reservation`)
- `fix`: A bug fix (e.g., `fix(validation): block duplicate gate turnstile entry`)
- `test`: Adding or updating automated tests (e.g., `test(concurrency): verify 10-way booking race condition`)
- `docs`: Documentation updates (e.g., `docs(architecture): add sequence diagrams for booking`)
- `ci`: CI/CD pipeline modifications (e.g., `ci(jenkins): add docker build and tag stages`)
- `chore`: Maintenance tasks (e.g., `chore: update dependencies and gitignore`)
