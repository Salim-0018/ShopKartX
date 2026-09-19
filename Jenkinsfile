pipeline {
    agent any

    environment {
        KUBE_CONFIG = '/var/jenkins_home/kube-ci/config'
        KUBE_NAMESPACE = 'shopkartx'
        ARGO_APP = 'shopkartx'
        TTM_DEPLOYMENT = 'deployment/shopkartx-ttm'
        TTM_PORT = '9105'
        TTM_DEPLOYMENT_ID = "${env.JOB_NAME}-${env.BUILD_NUMBER}"

        DOCKERHUB_CREDENTIALS = 'paul48'
        GITHUB_CREDENTIALS = 'github-shopkartx'

        FRONTEND_IMAGE = 'paul48/shopkartx-frontend'
        BACKEND_IMAGE = 'paul48/shopkartx-backend'

        IMAGE_TAG = "build-${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm

                script {
                    env.COMMIT_SHA = sh(
                        script: 'git rev-parse HEAD',
                        returnStdout: true
                    ).trim()

                    env.COMMIT_SHA_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    env.COMMIT_TIME = sh(
                        script: 'git show -s --format=%cI HEAD',
                        returnStdout: true
                    ).trim()

                    echo "Commit SHA: ${env.COMMIT_SHA}"
                    echo "Commit SHA Short: ${env.COMMIT_SHA_SHORT}"
                    echo "Commit Time: ${env.COMMIT_TIME}"
                }
            }
        }

        stage('Verify Kubernetes Access') {
            steps {
                sh '''
                    set -eu

                    echo "===== KUBERNETES ACCESS ====="

                    kubectl --kubeconfig="$KUBE_CONFIG" get nodes

                    echo
                    kubectl --kubeconfig="$KUBE_CONFIG" \
                      get pods -n "$KUBE_NAMESPACE"

                    echo
                    echo "Kubernetes access verified."
                '''
            }
        }

        stage('TTM Build Started') {
            steps {
                sh '''
                    set -eu

                    echo "===== TTM: BUILD STARTED ====="

                    TTM_PAYLOAD=$(cat <<EOF_PAYLOAD
{
  "deploymentId": "$TTM_DEPLOYMENT_ID",
  "commitSha": "$COMMIT_SHA",
  "commitTime": "$COMMIT_TIME",
  "event": "build_started",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "source": "jenkins"
}
EOF_PAYLOAD
)

                    kubectl --kubeconfig="$KUBE_CONFIG" \
                      exec -n "$KUBE_NAMESPACE" "$TTM_DEPLOYMENT" -- \
                      wget -qO- \
                      --header="Content-Type: application/json" \
                      --post-data="$TTM_PAYLOAD" \
                      "http://127.0.0.1:$TTM_PORT/events"

                    echo
                    echo "TTM build_started recorded."
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh '''
                        set -eu

                        echo "===== FRONTEND BUILD ====="

                        npm ci
                        npm run build

                        echo
                        echo "Frontend build completed successfully."
                    '''
                }
            }
        }

        stage('Backend Test') {
            steps {
                dir('backend') {
                    sh '''
                        set -eu

                        echo "===== BACKEND TEST ====="

                        npm ci
                        npm test -- --passWithNoTests

                        echo
                        echo "Backend tests completed successfully."
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    set -eu

                    echo "===== DOCKER BUILD ====="

                    docker build \
                      -f docker/frontend/Dockerfile \
                      -t "$FRONTEND_IMAGE:$IMAGE_TAG" \
                      .

                    docker build \
                      -f docker/backend/Dockerfile \
                      -t "$BACKEND_IMAGE:$IMAGE_TAG" \
                      .

                    echo
                    echo "Docker images built successfully."

                    docker images --format "table {{.Repository}}\\t{{.Tag}}\\t{{.Size}}" \
                      | grep -E 'shopkartx-(frontend|backend)'
                '''
            }
        }

        stage('Docker Hub Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKERHUB_CREDENTIALS}",
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    sh '''
                        set -eu

                        echo "===== DOCKER HUB LOGIN ====="

                        printf '%s' "$DOCKERHUB_TOKEN" | \
                          docker login \
                            --username "$DOCKERHUB_USERNAME" \
                            --password-stdin

                        echo
                        echo "Docker Hub login successful."

                        echo
                        echo "===== PUSH FRONTEND ====="

                        docker push "$FRONTEND_IMAGE:$IMAGE_TAG"

                        echo
                        echo "===== PUSH BACKEND ====="

                        docker push "$BACKEND_IMAGE:$IMAGE_TAG"

                        echo
                        echo "Docker Hub push completed."

                        docker logout >/dev/null 2>&1 || true
                    '''
                }
            }
        }

        stage('Update Kubernetes Manifests') {
            steps {
                sh '''
                    set -eu

                    echo "===== UPDATE KUBERNETES IMAGE REFERENCES ====="

                    sed -i \
                      "s#^[[:space:]]*image:.*#          image: $FRONTEND_IMAGE:$IMAGE_TAG#" \
                      kubernetes/frontend.yaml

                    sed -i \
                      "s#^[[:space:]]*image:.*#          image: $BACKEND_IMAGE:$IMAGE_TAG#" \
                      kubernetes/backend.yaml

                    sed -i \
                      's/imagePullPolicy: IfNotPresent/imagePullPolicy: Always/' \
                      kubernetes/frontend.yaml

                    sed -i \
                      's/imagePullPolicy: IfNotPresent/imagePullPolicy: Always/' \
                      kubernetes/backend.yaml

                    echo
                    echo "===== FRONTEND IMAGE ====="
                    grep -nE 'image:|imagePullPolicy:' kubernetes/frontend.yaml

                    echo
                    echo "===== BACKEND IMAGE ====="
                    grep -nE 'image:|imagePullPolicy:' kubernetes/backend.yaml

                    echo
                    echo "===== GIT DIFF ====="
                    git diff -- kubernetes/frontend.yaml kubernetes/backend.yaml
                '''
            }
        }

        stage('Commit and Push GitOps Change') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${GITHUB_CREDENTIALS}",
                        usernameVariable: 'GITHUB_USERNAME',
                        passwordVariable: 'GITHUB_TOKEN'
                    )
                ]) {
                    sh '''
                        set -eu

                        echo "===== GIT CONFIG ====="

                        git config user.name "ShopKartX Jenkins"
                        git config user.email "jenkins@shopkartx.local"

                        echo
                        echo "===== GIT STATUS ====="

                        git status --short

                        git add kubernetes/frontend.yaml kubernetes/backend.yaml

                        if git diff --cached --quiet; then
                            echo
                            echo "No Kubernetes manifest changes detected."
                            exit 0
                        fi

                        git commit \
                          -m "chore: deploy ShopKartX build ${BUILD_NUMBER}"

                        echo
                        echo "===== PUSHING GITOPS CHANGE TO GITHUB ====="

                        git remote set-url origin \
                          "https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/Salim-0018/ShopKartX.git"

                        git push origin HEAD:main

                        echo
                        echo "GitOps commit pushed successfully."
                    '''
                }
            }
        }

        stage('Wait for Argo CD Deployment') {
            steps {
                sh '''
                    set -eu

                    echo "===== WAITING FOR ARGO CD ====="

                    MAX_ATTEMPTS=36
                    ATTEMPT=1

                    while [ "$ATTEMPT" -le "$MAX_ATTEMPTS" ]; do

                        SYNC_STATUS=$(kubectl \
                          --kubeconfig="$KUBE_CONFIG" \
                          get application "$ARGO_APP" \
                          -n argocd \
                          -o jsonpath='{.status.sync.status}')

                        HEALTH_STATUS=$(kubectl \
                          --kubeconfig="$KUBE_CONFIG" \
                          get application "$ARGO_APP" \
                          -n argocd \
                          -o jsonpath='{.status.health.status}')

                        SYNC_REVISION=$(kubectl \
                          --kubeconfig="$KUBE_CONFIG" \
                          get application "$ARGO_APP" \
                          -n argocd \
                          -o jsonpath='{.status.sync.revision}')

                        echo
                        echo "Attempt $ATTEMPT/$MAX_ATTEMPTS"
                        echo "Argo CD Sync: $SYNC_STATUS"
                        echo "Argo CD Health: $HEALTH_STATUS"
                        echo "Argo CD Revision: $SYNC_REVISION"

                        kubectl --kubeconfig="$KUBE_CONFIG" \
                          get pods -n "$KUBE_NAMESPACE" -o wide

                        FRONTEND_IMAGE_RUNNING=$(kubectl \
                          --kubeconfig="$KUBE_CONFIG" \
                          get deployment shopkartx-frontend \
                          -n "$KUBE_NAMESPACE" \
                          -o jsonpath='{.spec.template.spec.containers[0].image}')

                        BACKEND_IMAGE_RUNNING=$(kubectl \
                          --kubeconfig="$KUBE_CONFIG" \
                          get deployment shopkartx-backend \
                          -n "$KUBE_NAMESPACE" \
                          -o jsonpath='{.spec.template.spec.containers[0].image}')

                        echo
                        echo "Frontend desired image: $FRONTEND_IMAGE:$IMAGE_TAG"
                        echo "Frontend cluster image: $FRONTEND_IMAGE_RUNNING"
                        echo "Backend desired image: $BACKEND_IMAGE:$IMAGE_TAG"
                        echo "Backend cluster image: $BACKEND_IMAGE_RUNNING"

                        if [ "$SYNC_STATUS" = "Synced" ] && \
                           [ "$HEALTH_STATUS" = "Healthy" ] && \
                           [ "$FRONTEND_IMAGE_RUNNING" = "$FRONTEND_IMAGE:$IMAGE_TAG" ] && \
                           [ "$BACKEND_IMAGE_RUNNING" = "$BACKEND_IMAGE:$IMAGE_TAG" ]; then

                            echo
                            echo "========================================"
                            echo "ARGO CD DEPLOYMENT DETECTED"
                            echo "========================================"

                            break
                        fi

                        if [ "$ATTEMPT" -eq "$MAX_ATTEMPTS" ]; then
                            echo
                            echo "Argo CD deployment timeout."
                            exit 1
                        fi

                        ATTEMPT=$((ATTEMPT + 1))
                        sleep 10
                    done
                '''
            }
        }

        stage('Wait for Kubernetes Rollout') {
            steps {
                sh '''
                    set -eu

                    echo "===== FRONTEND ROLLOUT ====="

                    kubectl --kubeconfig="$KUBE_CONFIG" \
                      rollout status \
                      deployment/shopkartx-frontend \
                      -n "$KUBE_NAMESPACE" \
                      --timeout=180s

                    echo
                    echo "===== BACKEND ROLLOUT ====="

                    kubectl --kubeconfig="$KUBE_CONFIG" \
                      rollout status \
                      deployment/shopkartx-backend \
                      -n "$KUBE_NAMESPACE" \
                      --timeout=180s

                    echo
                    echo "Kubernetes rollouts completed successfully."
                '''
            }
        }

        stage('Verify Production Readiness') {
            steps {
                sh '''
                    set -eu

                    echo "===== REAL PRODUCTION READINESS ====="

                    kubectl --kubeconfig="$KUBE_CONFIG" \
                      get pods -n "$KUBE_NAMESPACE" -o wide

                    FRONTEND_READY=$(kubectl \
                      --kubeconfig="$KUBE_CONFIG" \
                      get deployment shopkartx-frontend \
                      -n "$KUBE_NAMESPACE" \
                      -o jsonpath='{.status.readyReplicas}')

                    BACKEND_READY=$(kubectl \
                      --kubeconfig="$KUBE_CONFIG" \
                      get deployment shopkartx-backend \
                      -n "$KUBE_NAMESPACE" \
                      -o jsonpath='{.status.readyReplicas}')

                    FRONTEND_DESIRED=$(kubectl \
                      --kubeconfig="$KUBE_CONFIG" \
                      get deployment shopkartx-frontend \
                      -n "$KUBE_NAMESPACE" \
                      -o jsonpath='{.spec.replicas}')

                    BACKEND_DESIRED=$(kubectl \
                      --kubeconfig="$KUBE_CONFIG" \
                      get deployment shopkartx-backend \
                      -n "$KUBE_NAMESPACE" \
                      -o jsonpath='{.spec.replicas}')

                    echo
                    echo "Frontend Ready: ${FRONTEND_READY:-0}/${FRONTEND_DESIRED}"
                    echo "Backend Ready: ${BACKEND_READY:-0}/${BACKEND_DESIRED}"

                    if [ "${FRONTEND_READY:-0}" -ne "$FRONTEND_DESIRED" ]; then
                        echo "Frontend is not ready."
                        exit 1
                    fi

                    if [ "${BACKEND_READY:-0}" -ne "$BACKEND_DESIRED" ]; then
                        echo "Backend is not ready."
                        exit 1
                    fi

                    echo
                    echo "REAL PRODUCTION READINESS CONFIRMED."
                '''
            }
        }

        stage('TTM Production Ready') {
            steps {
                sh '''
                    set -eu

                    echo "===== TTM: PRODUCTION READY ====="

                    TTM_PAYLOAD=$(cat <<EOF_PAYLOAD
{
  "deploymentId": "$TTM_DEPLOYMENT_ID",
  "commitSha": "$COMMIT_SHA",
  "commitTime": "$COMMIT_TIME",
  "event": "production_ready",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "source": "jenkins-kubernetes-rollout"
}
EOF_PAYLOAD
)

                    kubectl --kubeconfig="$KUBE_CONFIG" \
                      exec -n "$KUBE_NAMESPACE" "$TTM_DEPLOYMENT" -- \
                      wget -qO- \
                      --header="Content-Type: application/json" \
                      --post-data="$TTM_PAYLOAD" \
                      "http://127.0.0.1:$TTM_PORT/events"

                    echo
                    echo "Production Ready event recorded."
                '''
            }
        }

        stage('Final TTM Report') {
            steps {
                sh '''
                    set -eu

                    echo "===== FINAL TTM REPORT ====="

                    kubectl --kubeconfig="$KUBE_CONFIG" \
                      exec -n "$KUBE_NAMESPACE" "$TTM_DEPLOYMENT" -- \
                      wget -qO- \
                      "http://127.0.0.1:$TTM_PORT/deployments/$TTM_DEPLOYMENT_ID"

                    echo
                '''
            }
        }
    }

    post {

        success {
            echo '''
========================================
ShopKartX REAL GITOPS DEPLOYMENT SUCCESS
========================================

Frontend image pushed to Docker Hub.
Backend image pushed to Docker Hub.
Kubernetes manifests updated.
GitOps change pushed to GitHub.
Argo CD deployment verified.
Kubernetes rollout verified.
Production readiness verified.
TTM production_ready recorded.
'''
        }

        failure {
            echo '''
========================================
ShopKartX GITOPS DEPLOYMENT FAILED
========================================

Check the failed stage above.

Production Ready is recorded only after
the Kubernetes rollout has been verified.
'''
        }

        always {
            sh '''
                echo
                echo "===== FINAL PIPELINE STATUS ====="

                kubectl --kubeconfig="$KUBE_CONFIG" \
                  get application "$ARGO_APP" \
                  -n argocd \
                  -o wide \
                  || true

                echo

                kubectl --kubeconfig="$KUBE_CONFIG" \
                  get pods -n "$KUBE_NAMESPACE" -o wide \
                  || true

                echo
            '''
        }
    }
}
