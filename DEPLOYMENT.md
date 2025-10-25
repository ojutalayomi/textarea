# 🚀 Deployment Guide

This guide explains how to set up and use GitHub Actions for automated npm publishing.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **npm Account**: You need an npm account with publish permissions
3. **Package Name**: Ensure your package name is available on npm

## 🔧 Setup Steps

### 1. Create NPM Token

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Navigate to **Account Settings** → **Access Tokens**
3. Click **"Generate New Token"**
4. Select **"Automation"** type (for CI/CD)
5. Copy the generated token

### 2. Add GitHub Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. **Name**: `NPM_TOKEN`
5. **Value**: Paste your npm token
6. Click **"Add secret"**

### 3. Verify Workflow Files

Ensure these files exist in your repository:
- `.github/workflows/ci.yml` - Continuous Integration
- `.github/workflows/release.yml` - Release and Publishing
- `.github/workflows/publish.yml` - Simple Publishing
- `scripts/release.js` - Release helper script

## 🎯 Publishing Methods

### Method 1: Using Release Script (Recommended)

```bash
# Patch release (1.0.0 → 1.0.1)
npm run release:patch

# Minor release (1.0.0 → 1.1.0)
npm run release:minor

# Major release (1.0.0 → 2.0.0)
npm run release:major

# Custom version
npm run release 1.2.3
```

### Method 2: Manual GitHub Actions

1. Go to **Actions** tab in your GitHub repository
2. Select **"Release and Publish"** workflow
3. Click **"Run workflow"**
4. Enter version number (e.g., `1.0.0`)
5. Click **"Run workflow"**

### Method 3: Git Tags

```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0
```

## 📦 What Happens During Publishing

1. **Build**: Creates `dist/` folder with all necessary files
2. **Test**: Runs any available tests
3. **Version Check**: Ensures version doesn't already exist on npm
4. **Publish**: Publishes to npm registry
5. **Release**: Creates GitHub release with changelog

## 🔍 Monitoring

### Check Workflow Status
- Go to **Actions** tab in your GitHub repository
- Look for the latest workflow run
- Green checkmark = Success
- Red X = Failed (check logs)

### Check npm Package
- Visit: `https://www.npmjs.com/package/react-textarea-enhanced`
- Verify your version appears
- Check installation instructions

## 🛠️ Troubleshooting

### Common Issues

#### "NPM_TOKEN not found"
- **Solution**: Add the NPM_TOKEN secret to your repository
- **Check**: Settings → Secrets and variables → Actions

#### "Version already exists"
- **Solution**: Update version in package.json
- **Check**: `npm view react-textarea-enhanced@1.0.0 version`

#### "Permission denied"
- **Solution**: Check npm token permissions
- **Check**: Ensure token has publish access

#### "Build failed"
- **Solution**: Test build locally first
- **Command**: `npm run build`

### Testing Locally

```bash
# Test build
npm run build

# Check output
ls -la dist/

# Test package
npm pack
```

## 📝 Workflow Files Explained

### `ci.yml`
- **Purpose**: Continuous Integration
- **Triggers**: Push to main, Pull Requests
- **Actions**: Build, test, validate

### `release.yml`
- **Purpose**: Release and Publishing
- **Triggers**: Git tags, manual dispatch
- **Actions**: Version check, publish, create release

### `publish.yml`
- **Purpose**: Simple publishing
- **Triggers**: Push to main, tags
- **Actions**: Build, test, publish

## 🎉 Success Checklist

- [ ] NPM_TOKEN secret added to GitHub
- [ ] Workflow files committed to repository
- [ ] Build script works locally (`npm run build`)
- [ ] Package name is available on npm
- [ ] First release triggered successfully
- [ ] Package appears on npm registry
- [ ] GitHub release created

## 🔄 Next Steps

After successful setup:

1. **Test the workflow** with a patch release
2. **Monitor the Actions tab** for any issues
3. **Update your README** with installation instructions
4. **Share your package** with the community!

## 📞 Support

If you encounter issues:

1. Check the **Actions** tab for error logs
2. Verify all **secrets** are properly set
3. Test **build process** locally
4. Check **npm permissions** and package availability

---

**Happy Publishing! 🚀**
