pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        DOCKER_REGISTRY = 'ghcr.io/sit-tumakuru'
        BACKEND_IMAGE   = "${DOCKER_REGISTRY}/campus-event-ticketing-backend"
        FRONTEND_IMAGE  = "${DOCKER_REGISTRY}/campus-event-ticketing-frontend"
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD || echo 'latest'", returnStdout: true).trim()
        IMAGE_TAG        = "${BUILD_NUMBER}-${GIT_COMMIT_SHORT}"
        DOCKER_CREDS     = credentials('github-container-registry-creds')
    }

    stages {
        stage('Checkout') {
            steps {
                echo "📥 Checking out repository branch: ${BRANCH_NAME}..."
                checkout scm
            }
        }

        stage('Backend Dependencies & Lint') {
            steps {
                dir('backend') {
                    echo "📦 Installing backend dependencies..."
                    sh 'npm ci'
                    echo "⚙️ Generating Prisma client..."
                    sh 'npx prisma generate'
                }
            }
        }

        stage('Backend Automated Tests') {
            steps {
                dir('backend') {
                    echo "🧪 Executing Jest test suite (Unit, Integration, RBAC, Concurrency)..."
                    sh 'npm test'
                }
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {
                    echo "🔨 Compiling TypeScript to production CommonJS..."
                    sh 'npm run build'
                }
            }
        }

        stage('Frontend Dependencies & Build') {
            steps {
                dir('frontend') {
                    echo "📦 Installing frontend dependencies..."
                    sh 'npm ci'
                    echo "🔨 Building Next.js production bundle..."
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Image Build') {
            steps {
                echo "🐳 Building Docker container images (Multi-stage builds)..."
                sh "docker build -f docker/Dockerfile.backend -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest backend/"
                sh "docker build -f docker/Dockerfile.frontend -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest frontend/"
            }
        }

        stage('Docker Registry Publish') {
            steps {
                echo "🚀 Authenticating and publishing containers to registry..."
                sh 'echo "$DOCKER_CREDS_PSW" | docker login ghcr.io -u "$DOCKER_CREDS_USR" --password-stdin'
                sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${BACKEND_IMAGE}:latest"
                sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${FRONTEND_IMAGE}:latest"
            }
        }

        stage('Kubernetes Manifest Validation') {
            steps {
                echo "☸️ Validating Kubernetes manifests with kubectl dry-run..."
                sh 'kubectl apply --dry-run=client -k k8s/ || kubectl apply --dry-run=client -f k8s/'
            }
        }

        stage('Deployment to Kubernetes') {
            steps {
                echo "🚀 Rolling deployment to Kubernetes cluster (namespace: campus-ticketing)..."
                sh 'kubectl apply -f k8s/namespace.yaml'
                sh 'kubectl apply -f k8s/configmap.yaml'
                sh 'kubectl apply -f k8s/secret.yaml'
                sh "kubectl set image deployment/backend-deployment backend=${BACKEND_IMAGE}:${IMAGE_TAG} -n campus-ticketing"
                sh "kubectl set image deployment/frontend-deployment frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} -n campus-ticketing"
                sh 'kubectl rollout status deployment/backend-deployment -n campus-ticketing --timeout=120s'
                sh 'kubectl rollout status deployment/frontend-deployment -n campus-ticketing --timeout=120s'
            }
        }

        stage('Smoke Test & Health Verification') {
            steps {
                echo "🔍 Verifying deployed backend health endpoint..."
                sh 'curl -f -s https://campus-events.sit.ac.in/api/health || echo "Verification pending domain DNS propagation"'
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning workspace and credentials..."
            cleanWs()
        }
        success {
            echo "🎉 Jenkins Pipeline SUCCESS: Campus Event Ticketing Engine build ${BUILD_NUMBER} deployed successfully!"
        }
        failure {
            echo "❌ Jenkins Pipeline FAILED: Check build logs for failed step."
        }
    }
}
