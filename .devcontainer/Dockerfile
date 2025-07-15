# This Dockerfile is kept for any custom requirements
# Most functionality is now handled by devcontainer features for better caching

FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Install any custom packages that aren't available as features
# Keep this minimal for better layer caching
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        # Add any custom packages here
        # Example: custom-package \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Switch to vscode user
USER vscode
