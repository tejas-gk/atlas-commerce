variable "aws_region" {
  description = "AWS region for the shared development platform."
  type        = string
}

variable "cluster_name" {
  description = "Name for the EKS cluster."
  type        = string
}

variable "environment" {
  description = "Environment label applied to all resources."
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the Atlas Commerce VPC."
  type        = string
}

variable "availability_zones" {
  description = "Availability zones used by the EKS cluster."
  type        = list(string)
}

variable "private_subnets" {
  description = "Private subnets for worker nodes and internal workloads."
  type        = list(string)
}

variable "public_subnets" {
  description = "Public subnets for ingress and load balancers."
  type        = list(string)
}

variable "node_instance_types" {
  description = "EC2 instance types for the default EKS node group."
  type        = list(string)
  default     = ["t3.large"]
}

variable "node_desired_size" {
  description = "Desired node count for the shared development node group."
  type        = number
  default     = 3
}

variable "node_min_size" {
  description = "Minimum node count for the shared development node group."
  type        = number
  default     = 2
}

variable "node_max_size" {
  description = "Maximum node count for the shared development node group."
  type        = number
  default     = 6
}

variable "common_tags" {
  description = "Additional tags applied to all Terraform-managed resources."
  type        = map(string)
  default     = {}
}
