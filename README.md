# AWS Bedrock Test Project

This project sets up a self-test environment for connecting to AWS Bedrock with Claude, creating an EKS cluster using Terraform, and deploying a simple Node.js app with Kubernetes.

## Prerequisites
- AWS account with appropriate permissions
- Terraform installed
- AWS CLI configured
- kubectl installed
- Python 3 with boto3

## Steps
1. **Test Bedrock Connection**: Run `python test_bedrock.py` to verify Bedrock access.
2. **Create EKS Cluster**: Navigate to `terraform/` and run `terraform init`, `terraform plan`, `terraform apply`.
3. **Deploy App**: Use `kubectl apply -f k8s/deployment.yaml` to deploy the app on EKS.

## Cleanup
- Run `terraform destroy` to remove EKS resources.
- Monitor AWS costs to avoid unexpected charges.

Note: AWS charges apply for Bedrock and EKS usage.