# DevOps Deployment & Operations Guide

**Institution:** Siddaganga Institute of Technology, Tumakuru  
**Course:** Activity Based Learning – 1 (SPM Practical Approach using DevOps Tools)  
**Academic Micro-Project 2026–27**  

---

## 1. Local Development Setup (Direct Node.js)

### Prerequisites
- Node.js v20+ or v22+
- npm v10+

### Step 1: Install & Initialize Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run build
npm start
```
The backend REST API will be active at `http://localhost:5000` with the health check at `http://localhost:5000/api/health`.

### Step 2: Install & Run Frontend
```bash
cd ../frontend
npm install
npm run build
npm start
```
The Next.js web application will be live at `http://localhost:3000`.

---

## 2. Docker & Multi-Container Compose Deployment

### 2.1 Multi-Container Stack (`docker-compose.yml`)
The docker stack orchestrates three containerized services:
1. `postgres`: Official PostgreSQL 16 Alpine with healthcheck and persistent volume storage.
2. `backend`: Node.js 22 Alpine multi-stage production container running Express and Prisma Client.
3. `frontend`: Node.js 22 Alpine multi-stage production container running Next.js 14.

### 2.2 Launch Command
```bash
docker compose up -d --build
```

### 2.3 Verify Running Containers
```bash
docker compose ps
```

---

## 3. Kubernetes (K8s) Cluster Deployment

All manifests are organized under `k8s/`:

```
k8s/
├── namespace.yaml
├── configmap.yaml
├── secret.yaml
├── backend-deployment.yaml
├── backend-service.yaml
├── frontend-deployment.yaml
├── frontend-service.yaml
└── ingress.yaml
```

### 3.1 Deployment Instructions
```bash
# 1. Create Isolated Namespace
kubectl apply -f k8s/namespace.yaml

# 2. Apply ConfigMap and Secret
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# 3. Deploy Backend Microservice & ClusterIP Service
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# 4. Deploy Frontend Microservice & ClusterIP Service
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# 5. Apply NGINX Ingress Controller Routing
kubectl apply -f k8s/ingress.yaml

# 6. Verify Pod Status & Rollout
kubectl get pods -n campus-ticketing
kubectl rollout status deployment/backend-deployment -n campus-ticketing
```

---

## 4. Jenkins CI/CD Pipeline

The project includes an enterprise-grade declarative `Jenkinsfile`:

### 4.1 Required Jenkins Credentials
Configure the following in **Jenkins Dashboard -> Manage Jenkins -> Credentials**:
- `github-container-registry-creds`: Username and Personal Access Token (PAT) for GitHub Container Registry (`ghcr.io`).

### 4.2 Pipeline Stages
1. **Checkout:** Pulls clean commit SHA from Git.
2. **Backend Dependencies & Lint:** Runs `npm ci` and `prisma generate`.
3. **Automated Tests:** Executes Jest test suite (Unit, Integration, RBAC, Concurrency). Pipeline automatically fails if any test fails.
4. **Backend Build:** Compiles TypeScript to CommonJS.
5. **Frontend Build:** Installs dependencies and builds optimized Next.js bundle.
6. **Docker Image Build:** Builds multi-stage Docker images tagged with build number and git SHA.
7. **Publish:** Pushes versioned images to container registry.
8. **K8s Manifest Validation:** Executes `kubectl apply --dry-run=client` against `k8s/`.
9. **Rolling Deployment:** Updates Kubernetes deployments with zero downtime.
10. **Smoke Verification:** Executes curl against `/api/health`.
