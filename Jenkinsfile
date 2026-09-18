pipeline {
    agent any

    environment {
        TTM_URL = 'http://shopkartx-ttm:9105'
        TTM_DEPLOYMENT_ID = "${env.JOB_NAME}-${env.BUILD_NUMBER}"
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
                script {
                    sh '''
                        curl -sS -X POST "$TTM_URL/events" \
                          -H "Content-Type: application/json" \
                          -d "{
                            \\"deployment_id\\": \\"$TTM_DEPLOYMENT_ID\\",
                            \\"commit_sha\\": \\"$COMMIT_SHA\\",
                            \\"commit_time\\": \\"$COMMIT_TIME\\",
                            \\"event\\": \\"build_started\\",
                            \\"event_time\\": \\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\"
                          }"
                    '''
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Completed') {
            steps {
                script {
                    sh '''
                        curl -sS -X POST "$TTM_URL/events" \
                          -H "Content-Type: application/json" \
                          -d "{
                            \\"deployment_id\\": \\"$TTM_DEPLOYMENT_ID\\",
                            \\"commit_sha\\": \\"$COMMIT_SHA\\",
                            \\"commit_time\\": \\"$COMMIT_TIME\\",
                            \\"event\\": \\"build_completed\\",
                            \\"event_time\\": \\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\"
                          }"
                    '''
                }
            }
        }

        stage('CI Validation') {
            steps {
                script {
                    sh '''
                        echo "===== ShopKartX CI Validation ====="
                        echo "Repository: ShopKartX"
                        echo "Commit: $COMMIT_SHA"
                        echo "Commit Time: $COMMIT_TIME"
                        echo "Build: $BUILD_NUMBER"
                        echo
                        echo "Production Ready event is intentionally NOT recorded here."
                        echo "It must come from actual Kubernetes/Argo CD readiness."
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'ShopKartX CI pipeline completed successfully.'
        }

        failure {
            echo 'ShopKartX CI pipeline failed.'
        }

        always {
            script {
                sh '''
                    echo "===== TTM RECORD ====="
                    curl -sS "$TTM_URL/deployments/$TTM_DEPLOYMENT_ID" || true
                '''
            }
        }
    }
}
