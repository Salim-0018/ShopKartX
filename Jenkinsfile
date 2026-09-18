pipeline {
    agent any

    environment {
        TTM_URL = 'http://host.docker.internal:9105'
        TTM_DEPLOYMENT_ID = "${env.BUILD_TAG}"
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

        stage('Build Start') {
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

        stage('Build Complete') {
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

        stage('Production Ready') {
            steps {
                script {
                    sh '''
                        curl -sS -X POST "$TTM_URL/events" \
                          -H "Content-Type: application/json" \
                          -d "{
                            \\"deployment_id\\": \\"$TTM_DEPLOYMENT_ID\\",
                            \\"commit_sha\\": \\"$COMMIT_SHA\\",
                            \\"commit_time\\": \\"$COMMIT_TIME\\",
                            \\"event\\": \\"production_ready_time\\",
                            \\"event_time\\": \\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\"
                          }"
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
    }
}
