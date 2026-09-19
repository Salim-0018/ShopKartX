pipeline {
    agent any

    environment {
        TTM_URL = 'http://shopkartx-ttm:9105'
        TTM_DEPLOYMENT_ID = "${env.JOB_NAME}-${env.BUILD_NUMBER}"
        KUBE_CONFIG = '/var/jenkins_home/kube-ci/config'
        KUBE_NAMESPACE = 'shopkartx'
        ARGO_APP = 'shopkartx'
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

                    env.COMMIT_TIME = sh(
                        script: 'git show -s --format=%cI HEAD',
                        returnStdout: true
                    ).trim()

                    echo "Commit SHA: ${env.COMMIT_SHA}"
                    echo "Commit Time: ${env.COMMIT_TIME}"
                }
            }
        }

        stage('Build Started') {
            steps {
                sh '''
                    set -e

                    echo "===== TTM: BUILD STARTED ====="

                    curl -fsS -X POST "$TTM_URL/events" \
                      -H "Content-Type: application/json" \
                      -d "{
                        \\"deploymentId\\": \\"$TTM_DEPLOYMENT_ID\\",
                        \\"commitSha\\": \\"$COMMIT_SHA\\",
                        \\"commitTime\\": \\"$COMMIT_TIME\\",
                        \\"event\\": \\"build_started\\",
                        \\"timestamp\\": \\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\",
                        \\"source\\": \\"jenkins\\"
                      }"

                    echo
                    echo "TTM build_started recorded."
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh '''
                        set -e

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
                        set -e

                        echo "===== BACKEND TEST ====="

                        npm ci
                        npm test -- --passWithNoTests

                        echo
                        echo "Backend tests completed successfully."
                    '''
                }
            }
        }

        stage('Docker Build Validation') {
            steps {
                sh '''
                    set -e

                    echo "===== DOCKER BUILD VALIDATION ====="

                    docker build \
                      -f docker/frontend/Dockerfile \
                      -t shopkartx-frontend:ci-${BUILD_NUMBER} \
                      .

                    docker build \
                      -f docker/backend/Dockerfile \
                      -t shopkartx-backend:ci-${BUILD_NUMBER} \
                      .

                    docker build \
                      -f ttm-service/Dockerfile \
                      -t shopkartx-ttm:ci-${BUILD_NUMBER} \
                      ttm-service

                    echo
                    echo "All Docker images built successfully."

                    docker images --format "table {{.Repository}}\\t{{.Tag}}\\t{{.Size}}" \
                      | grep -E 'shopkartx-(frontend|backend|ttm)'
                '''
            }
        }

        stage('Build Completed') {
            steps {
                sh '''
                    set -e

                    echo "===== TTM: BUILD COMPLETED ====="

                    curl -fsS -X POST "$TTM_URL/events" \
                      -H "Content-Type: application/json" \
                      -d "{
                        \\"deploymentId\\": \\"$TTM_DEPLOYMENT_ID\\",
                        \\"commitSha\\": \\"$COMMIT_SHA\\",
                        \\"commitTime\\": \\"$COMMIT_TIME\\",
                        \\"event\\": \\"build_completed\\",
                        \\"timestamp\\": \\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\",
                        \\"source\\": \\"jenkins\\"
                      }"

                    echo
                    echo "TTM build_completed recorded."
                '''
            }
        }

        stage('Verify Kubernetes Access') {
            steps {
                sh '''
                    set -e

                    echo "===== KUBERNETES ACCESS ====="

                    kubectl --kubeconfig="$KUBE_CONFIG" \
                      get nodes

                    echo
                    kubectl --kubeconfig="$KUBE_CONFIG" \
                      get pods -n "$KUBE_NAMESPACE"

                    echo
                    echo "Kubernetes access verified."
                '''
            }
        }

        stage('Verify Argo CD') {
            steps {
                sh '''
                    set -e

                    echo "===== ARGO CD STATUS ====="

                    kubectl --kubeconfig="$KUBE_CONFIG" \
                      get application "$ARGO_APP" \
                      -n argocd \
                      -o jsonpath='SYNC={.status.sync.status} HEALTH={.status.health.status}'

                    echo
                '''
            }
        }

        stage('Wait for Production Readiness') {
            steps {
                sh '''
                    set -e

                    echo "===== WAITING FOR REAL PRODUCTION READINESS ====="

                    MAX_ATTEMPTS=30
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

                        echo "Attempt $ATTEMPT/$MAX_ATTEMPTS"
                        echo "Argo CD Sync: $SYNC_STATUS"
                        echo "Argo CD Health: $HEALTH_STATUS"

                        POD_STATUS=$(kubectl \
                          --kubeconfig="$KUBE_CONFIG" \
                          get pods \
                          -n "$KUBE_NAMESPACE" \
                          -o jsonpath='{range .items[*]}{.metadata.name}={.status.phase}{"\\n"}{end}')

                        echo
                        echo "Pods:"
                        echo "$POD_STATUS"

                        NOT_READY=$(kubectl \
                          --kubeconfig="$KUBE_CONFIG" \
                          get pods \
                          -n "$KUBE_NAMESPACE" \
                          -o jsonpath='{range .items[*]}{range .status.containerStatuses[*]}{.ready}{"\\n"}{end}{end}' \
                          | grep -c '^false$' || true)

                        TOTAL_CONTAINERS=$(kubectl \
                          --kubeconfig="$KUBE_CONFIG" \
                          get pods \
                          -n "$KUBE_NAMESPACE" \
                          -o jsonpath='{range .items[*]}{range .status.containerStatuses[*]}x{"\\n"}{end}{end}' \
                          | wc -l)

                        if [ "$SYNC_STATUS" = "Synced" ] && \
                           [ "$HEALTH_STATUS" = "Healthy" ] && \
                           [ "$TOTAL_CONTAINERS" -gt 0 ] && \
                           [ "$NOT_READY" -eq 0 ]; then

                            echo
                            echo "========================================"
                            echo "REAL PRODUCTION READINESS CONFIRMED"
                            echo "========================================"

                            exit 0
                        fi

                        if [ "$ATTEMPT" -eq "$MAX_ATTEMPTS" ]; then
                            echo
                            echo "Production readiness timeout."
                            exit 1
                        fi

                        ATTEMPT=$((ATTEMPT + 1))
                        sleep 10
                    done
                '''
            }
        }

        stage('Production Ready') {
            steps {
                sh '''
                    set -e

                    echo "===== TTM: PRODUCTION READY ====="

                    curl -fsS -X POST "$TTM_URL/events" \
                      -H "Content-Type: application/json" \
                      -d "{
                        \\"deploymentId\\": \\"$TTM_DEPLOYMENT_ID\\",
                        \\"commitSha\\": \\"$COMMIT_SHA\\",
                        \\"commitTime\\": \\"$COMMIT_TIME\\",
                        \\"event\\": \\"production_ready\\",
                        \\"timestamp\\": \\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\",
                        \\"source\\": \\"jenkins-kubernetes-readiness\\"
                      }"

                    echo
                    echo "Production Ready event recorded."
                '''
            }
        }

        stage('Final TTM Report') {
            steps {
                sh '''
                    set -e

                    echo "===== FINAL TTM REPORT ====="

                    curl -fsS \
                      "$TTM_URL/deployments/$TTM_DEPLOYMENT_ID"

                    echo
                '''
            }
        }
    }

    post {

        success {
            echo '''
========================================
ShopKartX CI/CD VALIDATION SUCCESS
========================================

Build completed.
Kubernetes verified.
Argo CD verified.
Production readiness verified.
TTM production_ready recorded.
'''
        }

        failure {
            echo '''
========================================
ShopKartX PIPELINE FAILED
========================================

Production Ready event was NOT recorded
unless Kubernetes readiness was confirmed.
'''
        }

        always {
            script {
                sh '''
                    echo
                    echo "===== PIPELINE TTM RECORD ====="

                    curl -sS \
                      --max-time 10 \
                      "$TTM_URL/deployments/$TTM_DEPLOYMENT_ID" \
                      || true

                    echo
                '''
            }
        }
    }
}
