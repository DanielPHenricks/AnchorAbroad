#!/bin/bash

# Deploy React App to AWS using Terraform
set -e

echo "Starting React App Deployment to AWS..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

# Build React app
echo "📦 Building React application..."
cd ../frontend
npm run build

if [ ! -d "build" ]; then
    echo "❌ Build failed or build directory not found"
    exit 1
fi

echo "✅ React app built successfully"

# Initialize Terraform (if needed)
cd ../terraform
if [ ! -d ".terraform" ]; then
    echo "🔧 Initializing Terraform..."
    terraform init
fi

# Plan Terraform deployment
echo "📋 Planning Terraform deployment..."
terraform plan -out=tfplan

# Apply Terraform
echo "🏗️  Applying Terraform configuration..."
terraform apply tfplan

# Get S3 bucket name
S3_BUCKET=$(terraform output -raw s3_bucket_name)
echo "📁 S3 Bucket: $S3_BUCKET"

# Sync build files to S3
echo "📤 Uploading files to S3..."
aws s3 sync ../frontend/build/ s3://$S3_BUCKET --delete

# Get CloudFront distribution ID
CF_DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
echo "🌐 CloudFront Distribution: $CF_DISTRIBUTION_ID"

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
    --distribution-id $CF_DISTRIBUTION_ID \
    --paths "/*"

# Get final URL
FINAL_URL=$(terraform output -raw cloudfront_distribution_url)
echo ""
echo "🎉 Deployment Complete!"
echo "📍 Your app is available at: $FINAL_URL"
echo "⏱️  It may take 5-10 minutes for CloudFront to fully propagate"
echo ""
