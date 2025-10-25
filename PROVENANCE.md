# 🔐 Package Provenance with GitHub Actions

This guide explains how to publish npm packages with provenance using GitHub Actions, ensuring supply chain security and build transparency.

## 🎯 What is Package Provenance?

Package provenance is a security feature that creates a cryptographic link between your published npm package and the GitHub Actions workflow that built it. This provides:

- **Build Transparency** - Shows exactly where and how the package was created
- **Supply Chain Security** - Verifies the package came from your trusted CI/CD pipeline
- **Integrity Verification** - Users can verify package authenticity
- **Audit Trail** - Complete build history and source tracking

## 🚀 How It Works

### 1. **Automatic Provenance Generation**
When you use `npm publish --provenance` in GitHub Actions, npm automatically:
- Generates a provenance attestation
- Links the package to the specific workflow run
- Creates cryptographic signatures
- Stores build metadata

### 2. **Verification Process**
Users can verify packages by:
- Checking the package page on npmjs.com
- Using `npm audit signatures` command
- Viewing provenance information in package details

## 📋 Current Setup

Your workflows are already configured with provenance:

### Release Workflow (`.github/workflows/release.yml`)
```yaml
- name: Publish to npm
  if: steps.check-version.outputs.exists == 'false'
  run: npm publish --provenance --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Publish Workflow (`.github/workflows/publish.yml`)
```yaml
- name: Publish to npm
  run: npm publish --provenance --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 🔧 Enhanced Configuration

### 1. **Scoped Packages** (Recommended)
For better security, consider using scoped packages:

```json
{
  "name": "@ojutalayomi/react-textarea-enhanced",
  "publishConfig": {
    "access": "public"
  }
}
```

### 2. **Workflow Permissions**
Add explicit permissions to your workflows:

```yaml
permissions:
  contents: read
  id-token: write  # Required for provenance
  packages: write
```

### 3. **Enhanced Release Workflow**
```yaml
name: Release and Publish

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to publish (e.g., 1.0.0)'
        required: true
        default: 'patch'

permissions:
  contents: read
  id-token: write
  packages: write

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0
        
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        registry-url: 'https://registry.npmjs.org'
        scope: '@ojutalayomi'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build package
      run: npm run build
      
    - name: Run tests
      run: npm test --if-present
      
    - name: Publish to npm with provenance
      run: npm publish --provenance --access public
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 🔍 Verifying Provenance

### 1. **Check Package on npm**
- Visit your package page on npmjs.com
- Look for the "Provenance" section
- Verify the GitHub Actions workflow link

### 2. **Command Line Verification**
```bash
# Check package signatures
npm audit signatures

# View package provenance
npm view react-textarea-enhanced provenance
```

### 3. **GitHub Actions Verification**
- Go to your repository's Actions tab
- Find the workflow run that published the package
- Verify the build logs and artifacts

## 🛡️ Security Benefits

### 1. **Supply Chain Integrity**
- Prevents package tampering
- Ensures packages come from trusted sources
- Creates audit trail for security incidents

### 2. **Build Transparency**
- Shows exact build environment
- Links to source code and commits
- Provides build reproducibility

### 3. **User Trust**
- Users can verify package authenticity
- Reduces risk of supply chain attacks
- Builds confidence in your packages

## 📊 Monitoring and Alerts

### 1. **GitHub Actions Monitoring**
- Set up notifications for failed builds
- Monitor workflow success rates
- Track deployment metrics

### 2. **npm Package Monitoring**
- Monitor download statistics
- Set up security alerts
- Track package health scores

### 3. **Provenance Verification**
- Regular provenance checks
- Automated security scanning
- Supply chain monitoring

## 🚨 Troubleshooting

### Common Issues

#### "Provenance generation failed"
- **Solution**: Ensure `id-token: write` permission is set
- **Check**: Verify GitHub Actions has proper permissions

#### "Package already exists"
- **Solution**: Update version in package.json
- **Check**: Use `npm view package-name version` to check existing versions

#### "Permission denied"
- **Solution**: Verify NPM_TOKEN has publish permissions
- **Check**: Ensure token is properly configured in GitHub Secrets

### Debug Commands
```bash
# Check npm configuration
npm config list

# Verify token permissions
npm whoami

# Test package publishing (dry run)
npm publish --dry-run
```

## 🎉 Best Practices

### 1. **Always Use Provenance**
- Include `--provenance` flag in all publish commands
- Use GitHub Actions for all package publishing
- Avoid manual publishing

### 2. **Secure Workflow Design**
- Use minimal permissions
- Implement proper secret management
- Regular security audits

### 3. **Documentation**
- Document your build process
- Provide provenance verification instructions
- Maintain security documentation

## 📈 Advanced Features

### 1. **Automated Security Scanning**
```yaml
- name: Security scan
  run: npm audit --audit-level moderate
```

### 2. **Dependency Verification**
```yaml
- name: Verify dependencies
  run: npm ci --audit
```

### 3. **Build Reproducibility**
```yaml
- name: Lock file verification
  run: npm ci --frozen-lockfile
```

## 🔗 Resources

- [npm Package Provenance Documentation](https://docs.npmjs.com/about-package-provenance)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [Supply Chain Security Best Practices](https://github.com/ossf/secure-supply-chain)

---

**Your packages are now published with full provenance! 🔐✨**
