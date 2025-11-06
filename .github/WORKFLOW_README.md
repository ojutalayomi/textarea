# GitHub Actions Setup

This repository uses GitHub Actions for automated CI/CD and npm publishing.

## Workflows

### 1. CI (`ci.yml`)
- **Triggers**: Push to main/master/develop branches, Pull Requests
- **Purpose**: Run tests and build checks on multiple Node.js versions
- **Features**:
  - Tests on Node.js 16, 18, and 20
  - Builds the package
  - Validates build output
  - Runs tests (if available)

### 2. Release (`release.yml`)
- **Triggers**: 
  - Push tags starting with `v*` (e.g., `v1.0.0`)
  - Manual workflow dispatch
- **Purpose**: Publish to npm and create GitHub releases
- **Features**:
  - Version checking to prevent duplicate publishes
  - Automatic version updates
  - npm publishing
  - GitHub release creation

### 3. Publish (`publish.yml`)
- **Triggers**: Push to main/master branches, tags, Pull Requests
- **Purpose**: Simple publishing workflow
- **Features**:
  - Build and test
  - Publish to npm on main branch pushes
  - Manual publishing option

## Setup Instructions

### 1. Create NPM Token
1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Go to Account Settings → Access Tokens
3. Click "Generate New Token"
4. Select "Automation" type
5. Copy the token

### 2. Add GitHub Secret
1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Your npm token from step 1
6. Click "Add secret"

### 3. Publishing Methods

#### Method 1: Tag-based Publishing
```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0
```

#### Method 2: Manual Publishing
1. Go to Actions tab in GitHub
2. Select "Release and Publish" workflow
3. Click "Run workflow"
4. Enter version (e.g., 1.0.0)
5. Click "Run workflow"

#### Method 3: Direct Publishing
```bash
# Push to main branch (if configured)
git push origin main
```

## Package.json Scripts

Make sure your `package.json` has these scripts:
```json
{
  "scripts": {
    "build": "mkdir -p dist && cp src/index.ts dist/ && cp src/TextAreaBox.tsx dist/ && cp src/types.ts dist/ && npm run copy-css",
    "copy-css": "cp src/style/index.css dist/",
    "test": "npm test --if-present"
  }
}
```

## Troubleshooting

### Common Issues

1. **"NPM_TOKEN not found"**
   - Make sure you've added the NPM_TOKEN secret to your repository

2. **"Version already exists"**
   - The workflow checks if a version already exists on npm
   - Update your version in package.json before publishing

3. **"Build failed"**
   - Check that all required files exist in the dist folder
   - Ensure your build script is working locally

4. **"Permission denied"**
   - Make sure your npm token has publish permissions
   - Check that the package name is available on npm

### Testing Locally

Before pushing, test your build locally:
```bash
npm run build
ls -la dist/
```

## Security Notes

- Never commit npm tokens to your repository
- Use GitHub Secrets for sensitive information
- The NPM_TOKEN should have minimal required permissions
- Consider using scoped packages for better security
