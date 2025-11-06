#!/bin/bash

# Deploy Application to AWS EC2 using Terraform
set -e

echo "Starting Deployment to AWS..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

# Check if SSH key exists
if [ ! -f ~/.ssh/anchor-abroad-key ]; then
    echo "🔑 Generating SSH key..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/anchor-abroad-key -N ""
    echo "✅ SSH key generated at ~/.ssh/anchor-abroad-key"
fi

# Get SSH public key
SSH_PUBLIC_KEY=$(cat ~/.ssh/anchor-abroad-key.pub)

# Initialize Terraform (if needed)
if [ ! -d ".terraform" ]; then
    echo "🔧 Initializing Terraform..."
    terraform init
fi

# Create terraform.tfvars if it doesn't exist
if [ ! -f "terraform.tfvars" ]; then
    echo "📝 Creating terraform.tfvars..."
    cat > terraform.tfvars <<EOF
aws_region     = "us-east-1"
project_name   = "anchor-abroad"
environment    = "dev"
ssh_public_key = "$SSH_PUBLIC_KEY"
EOF
fi

# Plan Terraform deployment
echo "📋 Planning Terraform deployment..."
terraform plan -out=tfplan

# Apply Terraform
echo "🏗️  Applying Terraform configuration..."
terraform apply tfplan

# Get server IP
SERVER_IP=$(terraform output -raw server_ip)
echo "📍 Server IP: $SERVER_IP"

# Wait for SSH to become available
echo "⏳ Waiting for server to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0
until ssh -i ~/.ssh/anchor-abroad-key -o StrictHostKeyChecking=no -o ConnectTimeout=5 ec2-user@$SERVER_IP "echo 'SSH Ready'" 2>/dev/null
do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ Timeout waiting for SSH connection"
        exit 1
    fi
    echo "   Attempt $RETRY_COUNT/$MAX_RETRIES - waiting 10 seconds..."
    sleep 10
done
echo "✅ Server is ready"

# Wait for Docker to be installed and running
echo "⏳ Waiting for Docker to be ready..."
MAX_RETRIES=20
RETRY_COUNT=0
until ssh -i ~/.ssh/anchor-abroad-key -o StrictHostKeyChecking=no ec2-user@$SERVER_IP "docker ps" 2>/dev/null
do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ Timeout waiting for Docker"
        exit 1
    fi
    echo "   Attempt $RETRY_COUNT/$MAX_RETRIES - waiting 10 seconds..."
    sleep 10
done
echo "✅ Docker is ready"

# Copy application files to server
echo "📤 Uploading application to server..."
cd ..
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'terraform' \
    -e "ssh -i ~/.ssh/anchor-abroad-key -o StrictHostKeyChecking=no" \
    ./ ec2-user@$SERVER_IP:/home/ec2-user/app/

# SSH into server and start application
echo "🚀 Starting application on server..."
ssh -i ~/.ssh/anchor-abroad-key -o StrictHostKeyChecking=no ec2-user@$SERVER_IP << 'ENDSSH'
cd /home/ec2-user/app

# Start Docker containers
docker-compose down || true
docker-compose up -d --build

echo "✅ Application started successfully"
ENDSSH

# Get URLs
BACKEND_URL=$(cd terraform && terraform output -raw backend_url)
FRONTEND_URL=$(cd terraform && terraform output -raw frontend_url)

echo ""
echo "🎉 Deployment Complete!"
echo "================================================"
echo "📍 Server IP: $SERVER_IP"
echo "🔗 Backend API: $BACKEND_URL"
echo "🔗 Frontend: $FRONTEND_URL"
echo "🔑 SSH: ssh -i ~/.ssh/anchor-abroad-key ec2-user@$SERVER_IP"
echo "================================================"
echo "⏱️  It may take 2-3 minutes for the application to fully start"
echo ""
