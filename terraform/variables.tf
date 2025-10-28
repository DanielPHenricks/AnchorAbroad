variable "aws_region" {
  description = "AWS region to deploy to. Default is US East 1 (N. Virginia)"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "anchor-abroad"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access"
  type        = string
}