# Deployment Guide

## First Deployment

1. Set environment variables:
```bash
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION="us-east-1"
export APP_NAME="rate-my-idea-express-app"
```

2. Create `terraform/terraform.tfvars`:
```hcl
mongodb_uri = "your-mongodb-uri"
app_port    = 3000
aws_region  = "us-east-1"
app_name    = "rate-my-idea-express-app"
```

3. Build and push Docker image:
```bash
docker build -t $APP_NAME:latest .
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
docker tag $APP_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$APP_NAME:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$APP_NAME:latest
```

4. Deploy with Terraform:
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

5. Get your app URL:
```bash
terraform output app_runner_service_url
```

## Redeploy After Code Changes

Run from root directory:

```bash
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION="us-east-1"
export APP_NAME="rate-my-idea-express-app"

docker build -t $APP_NAME:latest .
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
docker tag $APP_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$APP_NAME:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$APP_NAME:latest

cd terraform
terraform output app_runner_service_url
```

App Runner will automatically redeploy within a few minutes.

## Check Logs

```bash
aws logs tail /aws/apprunner/rate-my-idea-express-app --follow
```

## Troubleshooting

**App won't start?** Check logs above and ensure Express app listens on `0.0.0.0`:
```javascript
app.listen(process.env.PORT || 3000, '0.0.0.0')
```

**MongoDB connection fails?** Verify `mongodb_uri` in `terraform/terraform.tfvars` is correct.

## Destroy Everything

```bash
cd terraform
terraform destroy
```