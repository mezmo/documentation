library 'magic-butler-catalogue'

def CREDS = [
    string(credentialsId: 'github-api-token',
           variable: 'GITHUB_TOKEN'),
    string(credentialsId: 'openai-api-key',
           variable: 'OPENAI_API_KEY'),
    aws(credentialsId: 'qdrant-rw',
        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'),
]

// The whole repo is the knowledge base; qdrant-manager scans it from the
// workspace mount, so no --kb-path is needed. Hidden pages are excluded via
// `hidden: true` frontmatter.
def COLLECTION = "kb-${new Date().format('yyyyMMdd-HHmm')}"

pipeline {
    agent {
        node {
            label 'ec2-fleet'
            customWorkspace("/tmp/workspace/${env.BUILD_TAG}")
        }
    }

    options {
        timeout time: 1, unit: 'HOURS'
        timestamps()
        ansiColor 'xterm'
        disableConcurrentBuilds()
        withCredentials(CREDS)
    }

    stages {
        stage('Prepare') {
            steps {
                sh 'mkdir -p tmp output'
            }
        }

        stage('Sync Collection') {
            stages {
                stage('Start Containers') {
                    steps {
                        sh 'docker-compose up -d --wait'
                    }
                }

                stage('Restore Backup') {
                    steps {
                        sh """
                            docker exec qdrant-manager /app/.venv/bin/qdrant-manager backup restore \
                            -f ^kb --latest -T ${COLLECTION} --host qdrant
                        """
                    }
                }

                stage('Check Sync Status') {
                    steps {
                        script {
                            env.SYNC_STATUS = sh(
                                script: """
                                    docker exec qdrant-manager /app/.venv/bin/qdrant-manager sync status \
                                    -C ${COLLECTION} --host qdrant --json
                                """,
                                returnStatus: true
                            ).toString()

                            if (env.SYNC_STATUS == '2') {
                                error('sync status check failed with exit code 2')
                            }
                        }
                    }
                }

                stage('Sync Diff') {
                    when {
                        expression { env.SYNC_STATUS == '1' }
                    }
                    steps {
                        sh """
                            docker exec qdrant-manager /app/.venv/bin/qdrant-manager sync diff \
                            --host qdrant -C ${COLLECTION}
                        """
                    }
                }

                stage('Sync Apply') {
                    when {
                        expression { env.SYNC_STATUS == '1' }
                    }
                    steps {
                        sh """
                            docker exec qdrant-manager /app/.venv/bin/qdrant-manager sync apply \
                            --host qdrant -C ${COLLECTION} -y
                        """
                    }
                }

                stage('Evaluate') {
                    when {
                        expression { env.SYNC_STATUS == '1' }
                    }
                    steps {
                        sh """
                            docker exec qdrant-manager /app/.venv/bin/qdrant-manager eval run \
                            --host qdrant --collection-name ${COLLECTION}
                        """
                    }
                }

                stage('Backup') {
                    when {
                        allOf {
                            expression { env.SYNC_STATUS == '1' }
                            anyOf {
                                branch 'master'
                                branch 'main'
                            }
                        }
                    }
                    steps {
                        sh """
                            docker exec qdrant-manager /app/.venv/bin/qdrant-manager backup create \
                            --host qdrant --collection-name ${COLLECTION}
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker-compose down --volumes --remove-orphans || true'
            jiraSendBuildInfo site: 'logdna.atlassian.net'
        }
    }
}
