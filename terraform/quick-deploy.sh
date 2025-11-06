#!/bin/bash

# Quick deployment script - simplest possible deployment
set -e

echo "🚀 Quick Deploy to AWS"
echo "======================"
echo ""

# Check AWS CLI
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ Please configure AWS CLI first:"
    echo "   aws configure"
    exit 1
fi

# Generate SSH key if needed
if [ ! -f ~/.ssh/anchor-abroad-key ]; then
    echo "🔑 Generating SSH key..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/anchor-abroad-key -N ""
fi

# Create tfvars if needed
if [ ! -f terraform.tfvars ]; then
    echo "📝 Creating config..."
    cat > terraform.tfvars <<EOF
aws_region     = "us-east-1"
project_name   = "anchor-abroad"
environment    = "dev"
ssh_public_key = "$(cat ~/.ssh/anchor-abroad-key.pub)"
EOF
fi

# Init Terraform
if [ ! -d .terraform ]; then
    terraform init
fi

# Deploy
echo "🏗️  Deploying infrastructure..."
terraform apply -auto-approve

# Get IP
SERVER_IP=$(terraform output -raw server_ip)

# Wait for SSH
echo "⏳ Waiting for SSH..."
MAX_RETRIES=30
RETRY_COUNT=0
until ssh -i ~/.ssh/anchor-abroad-key -o StrictHostKeyChecking=no -o ConnectTimeout=5 ec2-user@$SERVER_IP "echo 'SSH Ready'" 2>/dev/null
do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ Timeout"
        exit 1
    fi
    sleep 10
done

# Wait for Docker
echo "⏳ Waiting for Docker..."
MAX_RETRIES=20
RETRY_COUNT=0
until ssh -i ~/.ssh/anchor-abroad-key -o StrictHostKeyChecking=no ec2-user@$SERVER_IP "docker ps" 2>/dev/null
do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ Timeout"
        exit 1
    fi
    sleep 10
done

# Upload app
echo "📤 Uploading application..."
cd ..
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'terraform' \
    -e "ssh -i ~/.ssh/anchor-abroad-key -o StrictHostKeyChecking=no" \
    ./ ec2-user@$SERVER_IP:/home/ec2-user/app/

# Start
echo "🚀 Starting application..."
ssh -i ~/.ssh/anchor-abroad-key -o StrictHostKeyChecking=no ec2-user@$SERVER_IP \
    'cd app && docker-compose up -d --build'

echo ""
echo "✅ Done!"
echo "Frontend: http://$SERVER_IP:3000"
echo "Backend:  http://$SERVER_IP:8000"
echo ""
