# Jenkins

`Jenkinsfile` provides a Linux-based declarative pipeline that:

- detects changed services in the monorepo
- builds only the impacted images
- optionally runs the k6 smoke suite
- optionally applies Terraform
- optionally deploys the Kubernetes manifests

Recommended Jenkins credentials:

- `dockerhub-creds`: Docker Hub username and token
- `aws-devops-creds`: AWS access key pair for Terraform
- `kubeconfig-atlas-dev`: kubeconfig file for the target cluster

The helper script in `../scripts/detect-changed-services.sh` is shared logic for the pipeline.
