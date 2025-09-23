locals {
  bucket_name = "${var.project_name}-${var.environment}-frontend-${random_id.bucket_suffix.hex}"
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
