#!/bin/bash

# Post-create script for development container
# This runs after the container is created and features are installed

set -e

echo "🚀 Running post-create setup..."

# Update package lists (features should have done most of the heavy lifting)
sudo apt-get update -y

# Install additional development tools that aren't available as features
sudo apt-get install -y \
    jq \
    htop \
    tree \
    wget \
    unzip \
    build-essential \
    curl \
    vim \
    nano \
    zip \
    ca-certificates \
    gnupg \
    lsb-release

# Install yq for YAML processing
echo "📦 Installing yq for YAML processing..."
sudo wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64
sudo chmod +x /usr/local/bin/yq

# Configure git with enhanced settings
echo "🔧 Configuring git..."
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.autocrlf input
git config --global core.editor "code --wait"

# Set git user details (update these with your information)
if [ ! "$(git config --global user.name)" ]; then
    git config --global user.name "Vinodkrishnan"
    git config --global user.email "vinodkrishnanv@users.noreply.github.com"
    echo "✅ Git configured with user details"
else
    echo "ℹ️ Git already configured with user: $(git config --global user.name)"
fi

# Set up docker group permissions for the vscode user
sudo usermod -aG docker vscode

# Ensure Docker daemon is accessible
sudo chmod 666 /var/run/docker-host.sock 2>/dev/null || true

# Clean up
sudo apt-get autoremove -y
sudo apt-get autoclean

# Verify installations
echo ""
echo "🔍 Verifying installations..."
echo "Docker: $(docker --version 2>/dev/null || echo 'Not available')"
echo "Node.js: $(node --version 2>/dev/null || echo 'Not available')"
echo "Python: $(python3 --version 2>/dev/null || echo 'Not available')"
echo "Git: $(git --version 2>/dev/null || echo 'Not available')"
echo "GitHub CLI: $(gh --version 2>/dev/null | head -1 || echo 'Not available')"
echo "kubectl: $(kubectl version -o json | jq -r '.clientVersion.gitVersion' 2>/dev/null || echo 'Not available - may need container restart')"
echo "Helm: $(helm version --short 2>/dev/null || echo 'Not available - may need container restart')"
echo "Terraform: $(terraform --version 2>/dev/null | head -1 || echo 'Not available - may need container restart')"
echo "yq: $(yq --version 2>/dev/null || echo 'Not available')"

echo ""
echo "✅ Post-create setup completed!"
echo "🐳 Docker-in-Docker is available"
echo "🔧 Development tools are ready"
echo "☸️ Kubernetes tools installed via features"
echo "🏗️ Infrastructure tools available via features"
echo "💡 If kubectl/helm/terraform are not available, please rebuild the container"
echo "🚀 Happy coding!"
