output "cluster_name" {
  description = "Provisioned EKS cluster name."
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "Provisioned EKS cluster API endpoint."
  value       = module.eks.cluster_endpoint
}

output "vpc_id" {
  description = "Provisioned VPC identifier."
  value       = module.vpc.vpc_id
}

output "configure_kubectl" {
  description = "Command to update local kubeconfig after apply."
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}
