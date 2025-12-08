# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ECR Repository for your Docker image
resource "aws_ecr_repository" "app" {
  name                 = var.app_name
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = var.app_name
  }
}

# IAM Role for App Runner to access ECR
resource "aws_iam_role" "app_runner_role" {
  name = "${var.app_name}-app-runner-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apprunner.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = var.app_name
  }
}

# IAM Policy for ECR access
resource "aws_iam_role_policy" "app_runner_policy" {
  name = "${var.app_name}-app-runner-policy"
  role = aws_iam_role.app_runner_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetAuthorizationToken",
          "ecr:DescribeImages"
        ]
        Resource = "*"
      }
    ]
  })
}

# App Runner Service
resource "aws_apprunner_service" "app" {
  service_name = var.app_name

  source_configuration {
    image_repository {
      image_identifier      = "${aws_ecr_repository.app.repository_url}:latest"
      image_repository_type = "ECR"

      image_configuration {
        port = var.app_port

        runtime_environment_variables = {
          MONGODB_URI = var.mongodb_uri
          NODE_ENV    = "production"
        }
      }
    }

    authentication_configuration {
      access_role_arn = aws_iam_role.app_runner_role.arn
    }

    auto_deployments_enabled = true
  }

  instance_configuration {
    cpu    = var.instance_cpu
    memory = var.instance_memory
  }

  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.app.arn

  tags = {
    Name        = var.app_name
    Environment = var.environment
  }
}

# Auto scaling configuration
resource "aws_apprunner_auto_scaling_configuration_version" "app" {
  auto_scaling_configuration_name = "rmi-config"

  max_concurrency                   = var.max_concurrency
  max_size                          = var.max_instances
  min_size                          = var.min_instances

  tags = {
    Name = var.app_name
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/apprunner/${var.app_name}"
  retention_in_days = var.log_retention_days

  tags = {
    Name = var.app_name
  }
}