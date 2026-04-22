#!/bin/bash
# Grant EKS cluster access to your AWS IAM user/root account
# Usage: ./grant-eks-access.sh [cluster-name] [region]

set -e  # Exit on error

# Configuration
CLUSTER_NAME="${1:-test-cluster}"
REGION="${2:-il-central-1}"

# Get AWS account ID and principal ARN
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
PRINCIPAL_ARN="arn:aws:iam::${ACCOUNT_ID}:root"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Granting EKS Access"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Cluster:   $CLUSTER_NAME"
echo "Region:    $REGION"
echo "Principal: $PRINCIPAL_ARN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Create access entry (if it doesn't exist)
echo "📝 Creating access entry..."
if aws eks create-access-entry \
    --cluster-name "$CLUSTER_NAME" \
    --principal-arn "$PRINCIPAL_ARN" \
    --region "$REGION" 2>/dev/null; then
    echo "✅ Access entry created"
else
    echo "⚠️  Access entry already exists (this is okay)"
fi

echo ""

# Step 2: Associate admin policy
echo "🔑 Associating admin policy..."
if aws eks associate-access-policy \
    --cluster-name "$CLUSTER_NAME" \
    --principal-arn "$PRINCIPAL_ARN" \
    --policy-arn arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy \
    --access-scope type=cluster \
    --region "$REGION" 2>&1 | grep -q "ConflictException"; then
    echo "⚠️  Policy already associated (this is okay)"
else
    echo "✅ Admin policy associated"
fi

echo ""

# Step 3: Update kubeconfig
echo "🔧 Updating kubeconfig..."
aws eks update-kubeconfig --region "$REGION" --name "$CLUSTER_NAME"
echo "✅ Kubeconfig updated"

echo ""

# Step 4: Test access
echo "🧪 Testing cluster access..."
if kubectl get nodes &>/dev/null; then
    echo "✅ Successfully connected to cluster!"
    echo ""
    kubectl get nodes
else
    echo "❌ Failed to connect to cluster"
    echo "   Try running: aws eks update-kubeconfig --region $REGION --name $CLUSTER_NAME"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Access granted successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
