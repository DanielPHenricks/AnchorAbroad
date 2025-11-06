#!/bin/bash

# Manual server setup script (alternative to deploy.sh)
# Use this if you want to manually configure the server

set -e

if [ -z "$1" ]; then
    echo "Usage: ./setup-server.sh <server-ip>"
    echo "Example: ./setup-server.sh 54.123.45.67"
    exit 1
fi

SERVER_IP=$1
SSH_KEY=~/.ssh/anchor-abroad-key

echo "🔧 Setting up server at $SERVER_IP..."

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found at $SSH_KEY"
    echo "Please run deploy.sh first or generate the key manually"
    exit 1
fi

# Copy application files
echo "📤 Uploading application files..."
cd ..
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'terraform' \
    -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    ./ ec2-user@$SERVER_IP:/home/ec2-user/app/

# Setup and start application
echo "🚀 Starting application..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no ec2-user@$SERVER_IP << 'ENDSSH'
cd /home/ec2-user/app

# Stop any running containers
docker-compose down || true

# Build and start containers
docker-compose up -d --build

# Show logs
echo ""
echo "✅ Application started!"
echo "Showing logs (Ctrl+C to exit):"
docker-compose logs -f
ENDSSH

echo ""
echo "🎉 Setup Complete!"
echo "Backend: http://$SERVER_IP:8000"
echo "Frontend: http://$SERVER_IP:3000"
echo ""
