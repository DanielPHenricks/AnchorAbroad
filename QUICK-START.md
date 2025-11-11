# Quick Start Guide

## What Changed?

Your deployment has been migrated from basic EC2 to a modern, scalable AWS architecture:

### Before (EC2)
- Single EC2 instance running Docker Compose
- Manual deployment with rsync
- No auto-scaling
- SQLite database
- No CDN

### After (ECS + S3)
- **Frontend**: React app on S3 + CloudFront CDN
- **Backend**: Django on ECS Fargate (auto-scaling containers)
- **Database**: RDS PostgreSQL (production-grade)
- **Storage**: S3 for media files
- **Load Balancer**: Distributes traffic across containers

## Deployment in 3 Steps

### 1. Configure AWS

```bash
aws configure
# Enter your AWS credentials
```

### 2. Deploy Infrastructure

```bash
cd terraform
terraform init
terraform apply
```

Wait 10-15 minutes for infrastructure creation.

### 3. Deploy Application

```bash
cd ..
./deploy-all.sh
```

That's it! Your application is now running on AWS.

## Get Your URLs

```bash
cd terraform
terraform output
```

Look for:
- `cloudfront_domain_name` - Your frontend URL
- `alb_dns_name` - Your backend API URL

## Quick Commands

### Deploy backend only
```bash
./deploy-backend.sh
```

### Deploy frontend only
```bash
./deploy-frontend.sh
```

### View logs
```bash
aws logs tail /ecs/anchorabroad-backend --follow
```

### Stop everything (save costs)
```bash
aws ecs update-service \
    --cluster anchorabroad-cluster \
    --service anchorabroad-backend-service \
    --desired-count 0
```

### Destroy all resources
```bash
cd terraform
terraform destroy
```

## What Each Script Does

### deploy-all.sh
Complete deployment pipeline:
1. Creates/updates AWS infrastructure
2. Builds backend Docker image
3. Pushes to ECR (Elastic Container Registry)
4. Updates ECS service
5. Builds React frontend
6. Uploads to S3
7. Invalidates CloudFront cache

### deploy-backend.sh
1. Logs into ECR
2. Builds Django Docker image with Gunicorn
3. Pushes to ECR
4. Forces ECS to deploy new version

### deploy-frontend.sh
1. Builds React production bundle
2. Uploads to S3
3. Invalidates CloudFront cache

## Files Changed

### New Files Created
- `terraform/main-ecs.tf` - ECS infrastructure
- `terraform/ecs.tf` - ECS cluster & services
- `terraform/rds.tf` - PostgreSQL database
- `terraform/s3.tf` - S3 buckets
- `terraform/cloudfront.tf` - CDN configuration
- `terraform/alb.tf` - Load balancer
- `terraform/ecr.tf` - Docker registry
- `terraform/security-groups.tf` - Security rules
- `deploy-all.sh` - Complete deployment
- `deploy-backend.sh` - Backend deployment
- `deploy-frontend.sh` - Frontend deployment
- `DEPLOYMENT.md` - Full documentation

### Modified Files
- `backend/Dockerfile` - Now uses Gunicorn (production server)
- `backend/requirements.txt` - Added production dependencies
- `backend/backend/settings.py` - Environment-based configuration
- `backend/backend/urls.py` - Added health check endpoint
- `frontend/Dockerfile` - Multi-stage build with nginx
- `frontend/nginx.conf` - Nginx configuration for React
- `terraform/variables.tf` - New configuration variables

### Old Files (Backed Up)
- `terraform/main.tf` → `terraform/main.tf.old`
- `DEPLOYMENT.md` → `DEPLOYMENT-OLD.md`

## Cost Estimate

Monthly cost (approximate):
- ECS Fargate: $5-10
- RDS t3.micro: $15 (free tier eligible)
- ALB: $16
- NAT Gateway: $32
- S3 + CloudFront: $1-5

**Total: ~$69-78/month** (lower with AWS free tier)

## Troubleshooting

### Deployment fails
```bash
# Check Terraform errors
cd terraform
terraform plan

# Check AWS credentials
aws sts get-caller-identity
```

### Backend not starting
```bash
# View ECS logs
aws logs tail /ecs/anchorabroad-backend --follow

# Check ECS service
aws ecs describe-services \
    --cluster anchorabroad-cluster \
    --services anchorabroad-backend-service
```

### Frontend shows 404
```bash
# Check S3 bucket
aws s3 ls s3://$(cd terraform && terraform output -raw frontend_bucket_name)/

# Redeploy frontend
./deploy-frontend.sh
```

## Next Steps

1. **Set up custom domain**: Configure Route 53
2. **Enable HTTPS**: Add SSL certificate via ACM
3. **Set up monitoring**: Configure CloudWatch alarms
4. **Add CI/CD**: Set up GitHub Actions
5. **Configure backups**: Enable automated RDS snapshots

## Need Help?

See `DEPLOYMENT.md` for detailed documentation.
