# Atlas Commerce DevOps

This directory centralizes the repo's delivery and platform assets:

- `terraform/`: baseline cloud and cluster provisioning for a shared dev environment
- `kubernetes/`: namespace, infra, workloads, and ingress manifests for the monorepo
- `jenkins/`: a Jenkins pipeline for teams that want CI/CD outside GitHub Actions
- `k6/`: performance scripts for smoke, ramp, checkout spike, and UI browsing scenarios
- `scripts/`: helper scripts used by CI/CD automation

## Quick start

```bash
terraform -chdir=devops/terraform/environments/dev init
terraform -chdir=devops/terraform/environments/dev plan -var-file=terraform.tfvars
kubectl kustomize devops/kubernetes/base
k6 run devops/k6/smoke.js
```

## Assumptions

- Images are published to Docker Hub and should be updated from `replace-me` placeholders before deployment.
- Kubernetes secrets are not committed. Use `atlas-secrets.example.yaml` as the template for your cluster secret.
- The repo still has a few legacy naming mismatches in older deployment assets; the manifests and scripts here use the current app names in `apps/`.
