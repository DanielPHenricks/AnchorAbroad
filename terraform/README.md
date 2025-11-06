# AWS Deployment Guide

Simple AWS deployment for Anchor Abroad application using Docker and Terraform.

## Prerequisites

1. AWS Account (Free Tier eligible)
2. AWS CLI installed and configured (`aws configure`)
3. Terraform installed
4. SSH client

## Quick Start

### One-Command Deployment

```bash
cd terraform
./deploy.sh
```

This script will:
- Generate SSH keys if needed
- Create AWS infrastructure (VPC, EC2, security groups)
- Upload your application
- Start Docker containers
- Display access URLs

### What Gets Created

**AWS Resources (All Free Tier):**
- 1x t2.micro EC2 instance (750 hours/month free)
- 1x VPC with public subnet
- 1x Internet Gateway
- 1x Elastic IP
- 1x Security Group (ports: 22, 80, 3000, 8000)
- 30GB EBS volume

**Cost:** $0/month within free tier limits

## Manual Steps (Alternative)

If you prefer manual control:

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Create SSH Key

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/anchor-abroad-key
```

### 3. Create terraform.tfvars

```hcl
aws_region     = "us-east-1"
project_name   = "anchor-abroad"
environment    = "dev"
ssh_public_key = "<paste your public key>"
```

### 4. Deploy Infrastructure

```bash
terraform plan -out=tfplan
terraform apply tfplan
```

### 5. Setup Server

```bash
./setup-server.sh $(terraform output -raw server_ip)
```

## Accessing Your Application

After deployment:

- **Frontend:** http://YOUR_IP:3000
- **Backend API:** http://YOUR_IP:8000
- **SSH:** `ssh -i ~/.ssh/anchor-abroad-key ec2-user@YOUR_IP`

## Updating Your Application

To deploy changes:

```bash
cd terraform
./setup-server.sh $(terraform output -raw server_ip)
```

## Managing Docker Containers

SSH into your server:

```bash
ssh -i ~/.ssh/anchor-abroad-key ec2-user@$(cd terraform && terraform output -raw server_ip)
```

Then use Docker Compose commands:

```bash
cd app

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## Cleaning Up

To destroy all AWS resources:

```bash
cd terraform
terraform destroy
```

## Troubleshooting

### Can't connect to server
- Wait 2-3 minutes after deployment for Docker to start
- Check security group allows your IP
- Verify instance is running: `terraform output server_ip`

### Application not starting
- SSH into server and check logs: `docker-compose logs`
- Verify Docker is running: `sudo systemctl status docker`
- Check container status: `docker ps -a`

### Database issues
- Django uses SQLite in a volume
- Reset database: SSH into server, `docker-compose down -v`, then `docker-compose up -d`

## Architecture

```
Internet
    |
Elastic IP
    |
EC2 Instance (t2.micro)
    |
Docker Compose
    ├── Backend (Django) - Port 8000
    └── Frontend (React) - Port 3000
```

## Notes

- This is a simple setup optimized for free tier
- Not production-ready (no HTTPS, load balancing, etc.)
- Backend runs in DEBUG mode for development
- SQLite database (not suitable for production scale)
- Consider using RDS, HTTPS, and CloudFront for production
