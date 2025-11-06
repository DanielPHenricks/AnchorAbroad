terraform {
    required_version = ">= 1.0.0"

    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "~> 6.0"
        }
    }
}

provider "aws" {
    region = var.aws_region
}

# VPC and Networking
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-vpc"
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.project_name}-public-subnet"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.project_name}-igw"
    Environment = var.environment
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "${var.project_name}-public-rt"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Security Group
resource "aws_security_group" "app_sg" {
  name_prefix = "${var.project_name}-"
  description = "Security group for ${var.project_name} application"
  vpc_id      = aws_vpc.main.id

  # SSH access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP access
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Django backend
  ingress {
    description = "Django Backend"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # React frontend
  ingress {
    description = "React Frontend"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-sg"
    Environment = var.environment
  }
}

# Key pair for SSH access
resource "aws_key_pair" "app_key" {
  key_name   = "${var.project_name}-key"
  public_key = var.ssh_public_key
}

# EC2 Instance (Free Tier t2.micro)
resource "aws_instance" "app_server" {
  ami           = "ami-0c02fb55956c7d316" # Amazon Linux 2023
  instance_type = "t2.micro"              # Free tier eligible

  key_name               = aws_key_pair.app_key.key_name
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  # User data to install Docker
  user_data = <<-EOF
    #!/bin/bash
    set -e

    # Update system
    yum update -y

    # Install Docker
    yum install -y docker
    systemctl start docker
    systemctl enable docker

    # Add ec2-user to docker group
    usermod -a -G docker ec2-user

    # Install docker-compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    # Install git
    yum install -y git

    # Create app directory
    mkdir -p /home/ec2-user/app
    chown -R ec2-user:ec2-user /home/ec2-user/app
  EOF

  tags = {
    Name        = "${var.project_name}-server"
    Environment = var.environment
  }

  # Increase root volume size (within free tier limits)
  root_block_device {
    volume_size = 30 # GB (free tier allows up to 30GB)
    volume_type = "gp2"
  }
}

# Elastic IP for consistent access
resource "aws_eip" "app_eip" {
  instance = aws_instance.app_server.id
  domain   = "vpc"

  tags = {
    Name        = "${var.project_name}-eip"
    Environment = var.environment
  }
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name = "django-vpc"
  }
}
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = {
    Name = "django-public-subnet"
  }
}
# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "django-igw"
  }
}
# Route table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = {
    Name = "django-public-rt"
  }
}
# Route table association
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
# Security Group for EC2
resource "aws_security_group" "django_sg" {
  name_prefix = "django-"
  vpc_id      = aws_vpc.main.id
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "django-sg"
  }
}
# Key pair for SSH access
resource "aws_key_pair" "django_key" {
  key_name   = "django-key"
  public_key = var.ssh_public_key
}

resource "aws_instance" "django_server" {
  ami           = "ami-0c02fb55956c7d316" # Amazon Linux 2 (free tier)
  instance_type = "t2.micro"              # Free tier
  key_name               = aws_key_pair.django_key.key_name
  subnet_id              = aws_subnet.public.id 
  vpc_security_group_ids = [aws_security_group.django_sg.id]
  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y docker
    systemctl start docker
    systemctl enable docker
    usermod -a -G docker ec2-user
    
    # Install docker-compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Create app directory
    mkdir -p /home/ec2-user/django-app
    chown ec2-user:ec2-user /home/ec2-user/django-app
  EOF
  tags = {
    Name = "django-server"
  }
}
# Elastic IP (optional, but helps with consistent access)
resource "aws_eip" "django_eip" {
  instance = aws_instance.django_server.id
  domain   = "vpc"
  tags = {
    Name = "django-eip"
  }
}

# Outputs
output "server_ip" {
  description = "Public IP of the application server"
  value       = aws_eip.app_eip.public_ip
}

output "server_dns" {
  description = "Public DNS of the application server"
  value       = aws_eip.app_eip.public_dns
}

output "ssh_command" {
  description = "SSH command to connect to the server"
  value       = "ssh -i ~/.ssh/${var.project_name}-key ec2-user@${aws_eip.app_eip.public_ip}"
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_eip.app_eip.public_ip}:8000"
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "http://${aws_eip.app_eip.public_ip}:3000"
}