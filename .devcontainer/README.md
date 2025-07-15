# Development Container Configuration

This devcontainer is optimized for startup performance and includes Docker-in-Docker support.

## Features

### 🚀 Performance Optimizations
- Uses official Microsoft devcontainer base image for better caching
- Leverages devcontainer features instead of custom installation scripts
- Minimal Dockerfile for custom requirements only
- Optimized layer structure for faster rebuilds

### 🐳 Docker-in-Docker Support
- Full Docker daemon running inside the container
- Docker Buildx support for multi-platform builds
- Azure DNS auto-detection for cloud environments
- Proper socket mounting for host Docker access

### 🛠️ Development Tools
- **Shell**: Zsh with Oh My Zsh configuration
- **Languages**: Node.js (LTS), Python 3.12, with full tooling
- **Git**: Enhanced Git with LFS support and GitHub CLI
- **Container Tools**: Docker-in-Docker with Buildx
- **Kubernetes**: kubectl, Helm for container orchestration
- **Infrastructure**: Terraform for Infrastructure as Code
- **Utilities**: jq, yq, htop, tree, and essential CLI tools
- **Extensions**: Comprehensive VS Code extension pack

## Quick Start

1. Open this repository in VS Code
2. When prompted, click "Reopen in Container"
3. Wait for the container to build and install features
4. Verify tools are available:
   ```bash
   docker --version
   node --version
   python3 --version
   kubectl version --client
   terraform --version
   ```

## 🧰 **Included Tools & Languages**

### **Programming Languages**
- **Node.js LTS** - JavaScript/TypeScript development
- **Python 3.12** - With pip, pylint, black formatter
- **Go** - (can be added via features if needed)

### **Container & Orchestration**
- **Docker** - Full Docker-in-Docker setup
- **Kubernetes** - kubectl for cluster management
- **Helm** - Kubernetes package manager

### **Infrastructure & DevOps**
- **Terraform** - Infrastructure as Code
- **GitHub CLI** - Repository management
- **Git LFS** - Large file support

### **Development Utilities**
- **jq/yq** - JSON/YAML processing
- **htop** - Process monitoring
- **tree** - Directory visualization
- **build-essential** - Compilation tools

## Customization

### Adding VS Code Extensions
Edit the `extensions` array in `.devcontainer/devcontainer.json`:

```json
"extensions": [
    "your.extension.id"
]
```

### Adding System Packages
Edit `.devcontainer/Dockerfile` for packages not available as features:

```dockerfile
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        your-package-name \
    && apt-get autoremove -y && apt-get clean -y
```

### Post-Creation Setup
Edit `.devcontainer/post-create.sh` for commands that should run after container creation.

## Architecture

```
┌─────────────────────────────────────┐
│ VS Code (Host)                      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│ Development Container               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Docker-in-Docker                │ │
│ │ - Full Docker daemon            │ │
│ │ - Buildx support                │ │
│ │ - Container management          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Development Tools               │ │
│ │ - Zsh + Oh My Zsh              │ │
│ │ - GitHub CLI                    │ │
│ │ - VS Code extensions            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Best Practices Implemented

1. **Layer Caching**: Using features and base images for maximum cache reuse
2. **Security**: Running as non-root user (`vscode`)
3. **Performance**: Minimal custom installation, leveraging pre-built components
4. **Maintainability**: Clear separation of concerns between Dockerfile, features, and post-create scripts
5. **Documentation**: Comprehensive setup documentation

## Troubleshooting

### kubectl/helm/terraform Commands Not Found
If you're getting "command not found" errors for these tools:

1. **Rebuild the container** - These tools are installed via devcontainer features:
   ```
   Ctrl+Shift+P → "Dev Containers: Rebuild Container"
   ```

2. **Check if features were installed**:
   ```bash
   # These should show version info
   kubectl version --client
   helm version --short
   terraform --version
   ```

3. **Manual verification**:
   ```bash
   # Check if binaries exist
   which kubectl
   which helm
   which terraform
   ```

### Docker Commands Fail
Ensure Docker-in-Docker is properly initialized:
```bash
sudo service docker start
docker --version
```

### Permission Issues
The post-create script should handle user permissions automatically. If issues persist:
```bash
sudo usermod -aG docker $USER
```

### Slow Startup
Check that you're using the latest base images and features are properly cached.
