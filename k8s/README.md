# Raw Kubernetes Manifests

This folder contains raw Kubernetes YAML manifests for reference and quick testing.

## Purpose

- **Quick Testing**: Deploy without Helm for debugging
- **Documentation**: Simple, readable examples
- **Reference**: Shows the base configuration before Helm templating

## Usage

```bash
# Deploy directly
kubectl apply -f deployment.yaml

# Delete
kubectl delete -f deployment.yaml
```

## Production Deployment

For production, use the Helm chart in `../helm/simple-app/` which provides:
- Parameterization via values.yaml
- Multiple environments support
- ArgoCD integration
- Version management

## Note

These manifests are kept in sync with the Helm chart templates but are **not** used for production deployments.
