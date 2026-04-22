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

### **Phase 2: Container Registry (15 min)** ✅ COMPLETED
1. Create Docker Hub account and repository
2. Build and tag Docker image
3. Push image to Docker Hub
4. Update K8s manifests to use Docker Hub image

### **Phase 3: Helm Chart Creation (30 min)** ✅ COMPLETED
1. Create Helm chart structure:
   ```bash
   helm create helm/simple-app
   ```
2. Configure `values.yaml` with application settings:
   - Image repository and tag
   - Service type (LoadBalancer)
   - Port mappings (80 → 3000)
   - Replica count
3. Customize templates:
   - Remove unnecessary resources (Ingress, ServiceAccount, etc.)
   - Fix container port to match application
   - Add health probes if needed
4. Test Helm chart locally:
   ```bash
   helm template simple-app ./helm/simple-app
   helm install simple-app ./helm/simple-app
   kubectl get pods,svc
   ```
5. Verify application is accessible via LoadBalancer

### **Phase 4: Manual CI/CD Process (30 min)** 🔄 NEXT
**Purpose**: Manually test the full deployment workflow before automation

1. **Make code change**:
   ```bash
   # Edit app/app.js - change the response message
   vim app/app.js
   ```

2. **Build new Docker image with version tag**:
   ```bash
   docker build -t <dockerhub-username>/simple-app:v2 .
   docker push <dockerhub-username>/simple-app:v2
   ```

3. **Update Helm values**:
   ```bash
   # Edit helm/simple-app/values.yaml
   # Change: tag: "v1" → tag: "v2"
   ```

4. **Deploy via Helm**:
   ```bash
   helm upgrade simple-app ./helm/simple-app
   ```

5. **Verify deployment**:
   ```bash
   kubectl rollout status deployment/simple-app-helm-simple-app
   curl http://<loadbalancer-url>
   ```

6. **Document the process** - This becomes the blueprint for CI automation

### **Phase 5: CI Pipeline with GitHub Actions (45 min)**
**Purpose**: Automate the build and push process tested in Phase 4

1. **Create `.github/workflows/ci.yml`**:
   ```yaml
   name: CI Pipeline
   on:
     push:
       branches: [main]
       paths:
         - 'app/**'
         - 'Dockerfile'
         # Don't trigger on values.yaml changes to avoid infinite loop
   
   jobs:
     build:
       runs-on: ubuntu-latest
       permissions:
         contents: write  # Allow pushing to repository
       steps:
         - name: Checkout code
           uses: actions/checkout@v4
           with:
             token: ${{ secrets.GITHUB_TOKEN }}
         
         - name: Set version tag
           id: version
           run: echo "VERSION=$(date +%Y%m%d-%H%M%S)" >> $GITHUB_OUTPUT
         
         - name: Login to Docker Hub
           uses: docker/login-action@v3
           with:
             username: ${{ secrets.DOCKER_USERNAME }}
             password: ${{ secrets.DOCKER_PASSWORD }}
         
         - name: Build and push Docker image
           uses: docker/build-push-action@v5
           with:
             context: .
             push: true
             tags: |
               ${{ secrets.DOCKER_USERNAME }}/simple-app:${{ steps.version.outputs.VERSION }}
               ${{ secrets.DOCKER_USERNAME }}/simple-app:latest
         
         - name: Update Helm values with new tag
           run: |
             sed -i "s/tag: .*/tag: \"${{ steps.version.outputs.VERSION }}\"/" helm/simple-app/values.yaml
         
         - name: Commit and push changes
           run: |
             git config user.name "github-actions[bot]"
             git config user.email "github-actions[bot]@users.noreply.github.com"
             git add helm/simple-app/values.yaml
             git diff-index --quiet HEAD || git commit -m "chore: update image tag to ${{ steps.version.outputs.VERSION }} [skip ci]"
             git push
   ```
   
   **Key Features:**
   - **Automatic versioning**: Uses timestamp (e.g., `20260422-153000`)
   - **Prevents infinite loop**: `[skip ci]` in commit message prevents re-triggering
   - **Only triggers on app changes**: Won't run when values.yaml is updated
   - **Dual tagging**: Creates both versioned tag and `latest`

2. **Configure GitHub Secrets**:
   - Go to GitHub repo → Settings → Secrets
   - Add `DOCKER_USERNAME`
   - Add `DOCKER_PASSWORD` (or use access token)

3. **Test the pipeline**:
   - Make a change to `app/app.js`
   - Commit and push to GitHub
   - Watch GitHub Actions build and deploy
   - Verify new image in Docker Hub
   - Check updated values.yaml in git

4. **Manually deploy the update**:
   ```bash
   git pull
   helm upgrade simple-app ./helm/simple-app
   ```

### **Phase 6: GitOps with ArgoCD (45 min)**
**Purpose**: Automate Helm deployments when values.yaml changes

1. **Install ArgoCD**:
   ```bash
   kubectl create namespace argocd
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
   ```

2. **Access ArgoCD UI**:
   ```bash
   kubectl port-forward svc/argocd-server -n argocd 8080:443
   # Get password:
   kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
   ```

3. **Create ArgoCD Application**:
   - Point to your GitHub repo
   - Path: `helm/simple-app`
   - Destination: your EKS cluster
   - Sync policy: Automatic (watches values.yaml)

4. **Test end-to-end flow**:
   - Change code in `app/app.js`
   - GitHub Actions builds new image
   - GitHub Actions updates `helm/simple-app/values.yaml`
   - ArgoCD detects change and syncs automatically
   - New pods deployed with new image

### **Phase 7: Logging Stack (30 min)**
1. Install Loki via Helm:
   ```bash
   helm repo add grafana https://grafana.github.io/helm-charts
   helm install loki grafana/loki-stack -n monitoring --create-namespace
   ```
2. Deploy Promtail as DaemonSet (collects logs from all pods)
3. Verify log collection
4. Configure log retention

### **Phase 8: Metrics Stack (30 min)**
1. Install Prometheus via Helm:
   ```bash
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring
   ```
2. Deploy Grafana (included in Prometheus stack)
3. Configure ServiceMonitors for app metrics
4. Verify metric scraping

### **Phase 9: Grafana Dashboards (15 min)**
1. Access Grafana:
   ```bash
   kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
   ```
2. Add Loki as datasource in Grafana
3. Import pre-built dashboards:
   - Kubernetes cluster overview
   - Application logs
   - Pod metrics
4. Create custom dashboards
5. Set up alerts (optional)

### **Phase 10: End-to-End Testing (15 min)**
1. Make code change and push to GitHub
2. Verify GitHub Actions builds and pushes image
3. Verify ArgoCD detects and syncs change
4. Check application deployment
5. View logs in Grafana
6. View metrics in Grafana

**Total Implementation Time**: ~4 hours

---

## 📈 Implementation Progress

| Phase | Status | Date Completed |
|-------|--------|----------------|
| Phase 1: Infrastructure | ✅ | 2026-04-21 |
| Phase 2: Container Registry | ✅ | 2026-04-21 |
| Phase 3: Helm Chart | ✅ | 2026-04-21 |
| Phase 4: Manual CI/CD | 🔄 | In Progress |
| Phase 5: GitHub Actions CI | ⏳ | Planned |
| Phase 6: ArgoCD GitOps | ⏳ | Planned |
| Phase 7: Logging (Loki) | ⏳ | Planned |
| Phase 8: Metrics (Prometheus) | ⏳ | Planned |
| Phase 9: Grafana Dashboards | ⏳ | Planned |
| Phase 10: E2E Testing | ⏳ | Planned |

## 🗂️ Project Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline (Phase 5)
├── app/
│   ├── app.js                  # Node.js Express application
│   └── package.json            # NPM dependencies
├── helm/
│   └── simple-app/             # Helm chart for production deployment
│       ├── Chart.yaml          # Chart metadata
│       ├── values.yaml         # Configuration values (updated by CI)
│       └── templates/          # Kubernetes manifest templates
│           ├── deployment.yaml
│           └── service.yaml
├── k8s/
│   ├── deployment.yaml         # Raw K8s manifests (for reference/testing)
│   └── README.md               # Explains purpose of this folder
├── terraform/
│   ├── main.tf                 # EKS infrastructure (single NAT)
│   └── aws-login-env.sh        # AWS credential helper script
├── Dockerfile                  # Multi-stage Docker build
├── .gitignore                  # Protects sensitive files
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