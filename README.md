# EKS Production-Ready Stack

A complete production-grade Kubernetes deployment featuring a Node.js application with full CI/CD pipeline, GitOps, and observability stack on AWS EKS.

## 🏗️ Architecture

```
GitHub (Source) → GitHub Actions (CI) → Docker Hub → ArgoCD (CD) → EKS Cluster
                                                                          ↓
                                                        ┌─────────────────────────────┐
                                                        │  Application Pods           │
                                                        │  Prometheus (Metrics)       │
                                                        │  Loki + Promtail (Logs)     │
                                                        │  Grafana (Visualization)    │
                                                        │  ArgoCD (GitOps)            │
                                                        └─────────────────────────────┘
```

## 📦 Technology Stack

### **Infrastructure**
- **Cloud Provider**: AWS
- **Kubernetes**: EKS 1.29
- **IaC**: Terraform
- **Nodes**: 2x t3.micro (1 NAT Gateway for cost optimization)

### **CI/CD**
- **CI**: GitHub Actions (automated build, test, push)
- **CD**: ArgoCD (GitOps-based deployment)
- **Container Registry**: Docker Hub (public)

### **Observability**
- **Metrics**: Prometheus + Grafana
- **Logging**: Loki + Promtail + Grafana
- **Visualization**: Grafana (unified dashboard)

### **Application**
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Container**: Docker (multi-stage build)

## 💰 Cost Estimate

| Resource | Quantity | Monthly Cost |
|----------|----------|--------------|
| EKS Control Plane | 1 | ~$73 |
| EC2 t3.micro nodes | 2 | ~$15 |
| NAT Gateway | 1 | ~$33 |
| Data Transfer | ~10GB | ~$1 |
| **Total** | | **~$122/month** |

> **💡 Cost Optimization**: Using 1 NAT Gateway instead of 3 saves ~$67/month

## 🚀 Prerequisites

### Required Tools
- **AWS CLI** - configured with credentials (`aws login`)
- **Terraform** - v1.0+ for infrastructure provisioning
- **kubectl** - for Kubernetes management
- **Docker** - for local testing
- **Helm** - for installing observability stack
- **Git** - for version control

### Required Accounts
- **AWS Account** - with EKS/EC2/VPC permissions
- **Docker Hub Account** - free tier (public repos)
- **GitHub Account** - for source code and CI/CD

### AWS Authentication
After `aws login`, run:
```bash
source terraform/aws-login-env.sh
```

## 📋 Implementation Plan

### **Phase 1: Infrastructure (15 min)**
1. Update Terraform to use single NAT Gateway
2. Apply infrastructure changes
3. Verify cluster access

### **Phase 2: Container Registry (15 min)**
1. Create Docker Hub account and repository
2. Build and tag Docker image
3. Push image to Docker Hub
4. Update K8s manifests to use Docker Hub image

### **Phase 3: CI Pipeline (30 min)**
1. Create GitHub repository
2. Push project code
3. Create `.github/workflows/ci.yml`:
   - Lint/test code
   - Build Docker image
   - Push to Docker Hub
   - Update GitOps repo manifest
4. Configure Docker Hub credentials in GitHub Secrets
5. Test automated build

### **Phase 4: GitOps with ArgoCD (45 min)**
1. Install ArgoCD on K8s cluster
2. Create separate GitOps repository for K8s manifests
3. Configure ArgoCD application:
   - Point to GitOps repo
   - Set sync policy (auto/manual)
   - Configure health checks
4. Access ArgoCD UI
5. Test deployment sync

### **Phase 5: Logging Stack (30 min)**
1. Install Loki via Helm:
   ```bash
   helm install loki grafana/loki-stack
   ```
2. Deploy Promtail as DaemonSet (collects logs from all pods)
3. Verify log collection
4. Configure log retention

### **Phase 6: Metrics Stack (30 min)**
1. Install Prometheus via Helm:
   ```bash
   helm install prometheus prometheus-community/kube-prometheus-stack
   ```
2. Deploy Grafana (or use one from Prometheus stack)
3. Configure ServiceMonitors for app metrics
4. Verify metric scraping

### **Phase 7: Grafana Dashboards (15 min)**
1. Add Loki as datasource in Grafana
2. Import pre-built dashboards:
   - Kubernetes cluster overview
   - Application logs
   - Pod metrics
3. Create custom dashboards
4. Set up alerts (optional)

### **Phase 8: End-to-End Testing (15 min)**
1. Make code change and push to GitHub
2. Verify GitHub Actions builds and pushes image
3. Verify ArgoCD detects and syncs change
4. Check application deployment
5. View logs in Grafana
6. View metrics in Grafana

**Total Implementation Time**: ~3 hours

## 🗂️ Project Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── app/
│   ├── app.js                  # Node.js Express application
│   └── package.json            # NPM dependencies
├── k8s/
│   └── deployment.yaml         # Kubernetes manifests (for GitOps repo)
├── terraform/
│   ├── main.tf                 # EKS infrastructure
│   └── aws-login-env.sh        # AWS credential helper
├── Dockerfile                  # Multi-stage Docker build
├── test_bedrock.py             # AWS Bedrock API test
└── README.md                   # This file
```

## 🔧 Quick Start

### 1. Deploy Infrastructure
```bash
cd terraform
source ./aws-login-env.sh
terraform apply
```

### 2. Build & Run Locally
```bash
docker build -t simple-app:latest .
docker run -p 3000:3000 simple-app:latest
curl http://localhost:3000  # Should return "hello from eks bro"
```

### 3. Deploy to Kubernetes
```bash
kubectl apply -f k8s/deployment.yaml
kubectl get pods
kubectl get service simple-app-service
```

### 4. Access Application
```bash
# Get LoadBalancer URL
kubectl get svc simple-app-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

## 📊 Monitoring & Observability

### Access Grafana
```bash
kubectl port-forward -n monitoring svc/grafana 3000:80
# Open http://localhost:3000
# Default credentials: admin/admin
```

### View Logs
```bash
# Via kubectl
kubectl logs -f deployment/simple-app

# Via Grafana: Explore → Loki → {app="simple-app"}
```

### View Metrics
```bash
# Via Grafana: Dashboards → Kubernetes / Compute Resources / Pod
```

### Access ArgoCD UI
```bash
kubectl port-forward -n argocd svc/argocd-server 8080:443
# Open https://localhost:8080
# Get password: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

## 🧹 Cleanup

### Delete Application
```bash
kubectl delete -f k8s/deployment.yaml
```

### Destroy Infrastructure
```bash
cd terraform
source ./aws-login-env.sh
terraform destroy
```

**⚠️ Important**: Always destroy resources when not in use to avoid charges (~$4/day)

## 🔐 Security Best Practices

- ✅ AWS credentials via IAM roles (not hardcoded)
- ✅ Docker Hub credentials stored in GitHub Secrets
- ✅ EKS cluster access via AWS IAM authentication
- ✅ Private subnets for worker nodes
- ✅ Security groups configured (least privilege)
- ✅ Health checks (readiness/liveness probes)
- ✅ Resource limits defined for pods

## 📚 Additional Resources

- [EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Prometheus Operator](https://prometheus-operator.dev/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)

## 🐛 Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### ArgoCD not syncing
```bash
kubectl get applications -n argocd
kubectl describe application <app-name> -n argocd
```

### Metrics not appearing
```bash
kubectl get servicemonitors -A
kubectl logs -n monitoring -l app=prometheus
```

## 📝 Notes

- **Bedrock Test**: Run `python test_bedrock.py` to verify AWS Bedrock API access
- **Node Capacity**: t3.micro nodes (1GB RAM) can run ~8-10 small pods
- **Autoscaling**: Not configured (for cost control)
- **Multi-AZ**: Using single NAT Gateway = single point of failure (acceptable for dev/learning)