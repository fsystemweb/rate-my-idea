# variables.tf
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"  # Change to your preferred region
}

variable "app_name" {
  description = "Name of your application"
  type        = string
  default     = "rate-my-idea-express-app"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# Application configuration
variable "app_port" {
  description = "Port your Express app listens on"
  type        = number
  default     = 3000
}

variable "node_env" {
  description = "Node environment"
  type        = string
  default     = "production"
}

variable "mongodb_uri" {
  description = "MongoDB connection URI"
  type        = string
  sensitive   = true
}

# Instance configuration
variable "instance_cpu" {
  description = "CPU units (256, 512, 1024, 2048, 4096)"
  type        = string
  default     = "256"
}

variable "instance_memory" {
  description = "Memory in MB (512, 1024, 2048, 3072, 4096)"
  type        = string
  default     = "512"
}

# Auto scaling
variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 4
}

variable "max_concurrency" {
  description = "Maximum concurrent requests per instance"
  type        = number
  default     = 100
}

variable "target_cpu_utilization" {
  description = "Target CPU utilization percentage"
  type        = number
  default     = 70
}

# Logging
variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}