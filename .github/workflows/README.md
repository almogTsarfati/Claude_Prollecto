# GitHub Actions CI/CD Workflows

## 📄 CI Pipeline (`ci.yml`)

### Purpose
Automatically builds, tags, and deploys your application when code changes are pushed to the `main` branch.

### Trigger
Runs when:
- ✅ Changes pushed to `main` branch
- ✅ Files modified in `app/` or `Dockerfile`
- ❌ Does NOT run on `helm/simple-app/values.yaml` changes (prevents infinite loop)

### What It Does

1. **Generates Version Tag**: Creates timestamp-based version (e.g., `20260422-153045`)
2. **Builds Docker Image**: Uses your `Dockerfile` to build the app
3. **Pushes to Docker Hub**: Tags with both version and `latest`
4. **Updates Helm Values**: Changes `tag:` in `helm/simple-app/values.yaml`
5. **Commits & Pushes**: Pushes updated values.yaml back to repo

### Required Secrets

Configure these in GitHub: **Settings → Secrets and variables → Actions**

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `DOCKER_USERNAME` | Your Docker Hub username | https://hub.docker.com |
| `DOCKER_PASSWORD` | Docker Hub access token | Hub → Account Settings → Security → New Access Token |

⚠️ **Use Access Token, not password!** More secure and can be revoked.

### How to Test

1. **Setup secrets** (one-time):
   ```bash
   # Go to: https://github.com/<your-username>/<repo>/settings/secrets/actions
   # Click "New repository secret"
   # Add DOCKER_USERNAME and DOCKER_PASSWORD
   ```

2. **Make a code change**:
   ```bash
   vim app/app.js  # Change the response message
   git add app/app.js
   git commit -m "feat: update welcome message"
   git push origin main
   ```

3. **Watch the workflow**:
   - Go to: https://github.com/<your-username>/<repo>/actions
   - Click on your commit
   - Watch each step execute

4. **Verify results**:
   ```bash
   # Check Docker Hub for new image
   # Check helm/simple-app/values.yaml for updated tag
   # If using ArgoCD, watch it auto-deploy
   ```

### Workflow Steps Explained

```yaml
# 1. Checkout code
uses: actions/checkout@v4
→ Downloads your repo code to runner

# 2. Set version tag
VERSION=$(date +%Y%m%d-%H%M%S)
→ Creates: 20260422-153045

# 3. Login to Docker Hub
uses: docker/login-action@v3
→ Authenticates with Docker Hub

# 4. Build and push
uses: docker/build-push-action@v5
→ Builds image and pushes:
  - almogtsarfati/simple-app:20260422-153045
  - almogtsarfati/simple-app:latest

# 5. Update Helm values
sed -i "s/tag: .*/tag: \"20260422-153045\"/" helm/simple-app/values.yaml
→ Changes:
  FROM: tag: "v2"
  TO:   tag: "20260422-153045"

# 6. Commit and push
git commit -m "chore: update image tag to 20260422-153045 [skip ci]"
→ Pushes updated values.yaml
→ [skip ci] prevents infinite loop
```

### Troubleshooting

**Error: "permission denied"**
- Check that `permissions: contents: write` is set
- Verify GitHub Actions has write access in repo settings

**Error: "could not read Username"**
- `DOCKER_USERNAME` secret not set or misspelled

**Error: "unauthorized"**
- `DOCKER_PASSWORD` is incorrect
- Use access token, not account password

**Workflow runs twice**
- Remove `[skip ci]` from commit message
- Or add `helm/**` to ignored paths

**sed command fails**
- File path is incorrect
- Check that `helm/simple-app/values.yaml` exists

### Integration with ArgoCD

Once this workflow runs:
1. ✅ New Docker image in Docker Hub
2. ✅ Updated `helm/simple-app/values.yaml` in git
3. 🔄 ArgoCD detects values.yaml change
4. 🔄 ArgoCD runs `helm upgrade`
5. ✅ New pods deployed with new image

**End-to-end automation complete!** 🎉

### Best Practices

- ✅ Use timestamp versions for traceability
- ✅ Always tag `latest` for easy rollback
- ✅ Use `[skip ci]` to prevent loops
- ✅ Use Docker Hub access tokens (not passwords)
- ✅ Monitor workflow runs for failures
- ✅ Test in a branch before merging to main

### Next Steps

After CI is working:
1. **Add ArgoCD** (Phase 6) - Auto-deploy when values.yaml changes
2. **Add Tests** - Run tests before building image
3. **Add Linting** - Validate code quality
4. **Add Notifications** - Slack/Discord on success/failure
