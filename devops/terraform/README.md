# Terraform

The Terraform scaffolding provisions a baseline AWS development platform for Atlas Commerce:

- VPC with public and private subnets
- EKS cluster
- managed node group
- tags aligned for the Kubernetes AWS load balancer controller and cluster discovery

## Usage

1. Copy `environments/dev/terraform.tfvars.example` to `environments/dev/terraform.tfvars`
2. Update the values for your AWS account and network ranges
3. Run:

```bash
terraform -chdir=devops/terraform/environments/dev init
terraform -chdir=devops/terraform/environments/dev plan -var-file=terraform.tfvars
terraform -chdir=devops/terraform/environments/dev apply -var-file=terraform.tfvars
```

## Notes

- This is intentionally a strong starting point, not a full production landing zone.
- Add remote state, IAM role separation, backups, and observability components before promoting this to production.
