#!/bin/bash

# Post-create script for Blockchain Investment Dashboard
# This runs after the container is created and features are installed

set -e

echo "🚀 Running post-create setup for Blockchain Investment Dashboard..."

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
    lsb-release \
    postgresql-client \
    redis-tools

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

# Set up PostgreSQL and Redis using Docker
echo "🐘 Setting up PostgreSQL database..."
if ! docker ps -a | grep -q cryptoview-postgres; then
    docker run -d \
        --name cryptoview-postgres \
        -e POSTGRES_DB=crypto_dashboard \
        -e POSTGRES_USER=cryptoview \
        -e POSTGRES_PASSWORD=cryptoview_password \
        -p 5432:5432 \
        -v postgres_data:/var/lib/postgresql/data \
        --restart unless-stopped \
        postgres:15-alpine
    echo "✅ PostgreSQL container created"
else
    echo "ℹ️ PostgreSQL container already exists, starting if needed..."
    docker start cryptoview-postgres || true
fi

echo "🔴 Setting up Redis cache..."
if ! docker ps -a | grep -q cryptoview-redis; then
    docker run -d \
        --name cryptoview-redis \
        -p 6379:6379 \
        -v redis_data:/data \
        --restart unless-stopped \
        redis:7-alpine
    echo "✅ Redis container created"
else
    echo "ℹ️ Redis container already exists, starting if needed..."
    docker start cryptoview-redis || true
fi

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if we have the base-codebase directory or need to create Next.js project
if [ -d "base-codebase" ]; then
    echo "📁 Found base-codebase directory, working within it..."
    cd base-codebase
elif [ -f "package.json" ]; then
    echo "📦 Found package.json in root, checking if it's the base template..."
    if grep -q "base-codespace" package.json; then
        echo "🔄 Detected base template, initializing Next.js project..."
        
        # Remove the basic server.js and package files
        rm -f server.js package.json package-lock.json
        rm -rf node_modules
        
        # Initialize Next.js project
        npx create-next-app@latest . \
            --typescript \
            --tailwind \
            --eslint \
            --app \
            --src-dir \
            --import-alias "@/*" \
            --use-npm
        
        echo "✅ Next.js project initialized"
    else
        echo "ℹ️ Custom package.json detected, installing dependencies..."
        npm install
    fi
else
    echo "🆕 No package.json found, creating Next.js project..."
    npx create-next-app@latest . \
        --typescript \
        --tailwind \
        --eslint \
        --app \
        --src-dir \
        --import-alias "@/*" \
        --use-npm
fi

# Initialize Prisma only if not already initialized
if [ ! -f "prisma/schema.prisma" ]; then
    echo "🔧 Initializing Prisma ORM..."
    npx prisma init
else
    echo "✅ Prisma already initialized"
fi

# Create environment variables template
if [ ! -f ".env.example" ]; then
    echo "⚙️ Creating environment variables template..."
    cat > .env.example << 'EOF'
# Database
DATABASE_URL="postgresql://cryptoview:cryptoview_password@localhost:5432/crypto_dashboard"

# API Keys
BLOCKCHAIR_API_KEY="your_blockchair_api_key"
COINGECKO_API_KEY="your_coingecko_api_key"
GEMINI_API_KEY="your_gemini_api_key"
NEWS_API_KEY="your_news_api_key"

# Authentication (Phase 2)
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Redis (for caching and jobs)
REDIS_URL="redis://localhost:6379"

# Development
NODE_ENV="development"
EOF
else
    echo "✅ Environment variables template already exists"
fi

# Copy to actual .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Environment variables file created"
else
    echo "ℹ️ Environment variables file already exists"
fi

# Create project structure only if directories don't exist
echo "📁 Creating project structure..."
mkdir -p src/lib/{api,database,ai}
mkdir -p src/components/{charts,dashboard,ui}
mkdir -p src/hooks
mkdir -p src/types
mkdir -p scripts
mkdir -p prisma/migrations

# Create a basic Prisma schema only if it doesn't exist
if [ ! -f "prisma/schema.prisma" ]; then
    echo "🗄️ Creating Prisma schema..."
    cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Cryptocurrency {
  id           String @id @default(cuid())
  symbol       String
  name         String
  blockchain   String
  blockchairId String?
  coingeckoId  String?
  isActive     Boolean @default(true)
  createdAt    DateTime @default(now())
  
  historicalData HistoricalData[]
  aiPredictions  AiPrediction[]
  newsSentiment  NewsSentiment[]
  
  @@map("cryptocurrencies")
}

model HistoricalData {
  id               String @id @default(cuid())
  cryptoId         String
  price            Decimal? @db.Decimal
  marketCap        Float?  @db.DoublePrecision
  volume24h        Float?  @db.DoublePrecision
  blockCount       Float?  @db.DoublePrecision
  transactionCount Float?  @db.DoublePrecision
  hashRate         Float?  @db.DoublePrecision
  timestamp        DateTime
  dataSource       String
  createdAt        DateTime @default(now())
  
  cryptocurrency   Cryptocurrency @relation(fields: [cryptoId], references: [id])
  
  @@map("historical_data")
}

model AiPrediction {
  id              String @id @default(cuid())
  cryptoId        String
  predictionType  String
  predictedValue  Decimal?
  confidenceScore Decimal?
  reasoning       String?
  validUntil      DateTime?
  createdAt       DateTime @default(now())
  
  cryptocurrency  Cryptocurrency @relation(fields: [cryptoId], references: [id])
  
  @@map("ai_predictions")
}

model NewsSentiment {
  id             String @id @default(cuid())
  cryptoId       String
  headline       String
  url            String?
  sentimentScore Decimal?
  source         String?
  publishedAt    DateTime?
  createdAt      DateTime @default(now())
  
  cryptocurrency Cryptocurrency @relation(fields: [cryptoId], references: [id])
  
  @@map("news_sentiment")
}
EOF
else
    echo "✅ Prisma schema already exists"
fi

# Install Python dependencies for AI/ML only if not already installed
if ! python3 -c "import pandas, numpy, requests, redis, psycopg2, google.generativeai" 2>/dev/null; then
    echo "🐍 Installing Python dependencies..."
    pip3 install --user \
        pandas \
        numpy \
        requests \
        python-dotenv \
        redis \
        psycopg2-binary \
        google-generativeai \
        scikit-learn \
        matplotlib \
        seaborn
else
    echo "✅ Python dependencies already installed"
fi

# Generate Prisma client only if needed
if [ ! -d "node_modules/@prisma/client" ] || [ ! -f "node_modules/.prisma/client/index.js" ]; then
    echo "🔄 Generating Prisma client..."
    npx prisma generate
else
    echo "✅ Prisma client already generated"
fi

# Try to run migrations (will fail if DB isn't ready, but that's okay)
echo "🚀 Running database migrations..."
npx prisma db push || echo "⚠️ Database not ready for migrations, run 'npx prisma db push' later"

# Return to root directory for the rest of the script
cd /workspaces/cryptoview

# Clean up
sudo apt-get autoremove -y
sudo apt-get autoclean

# Verify installations
echo ""
echo "🔍 Verifying installations..."
echo "Docker: $(docker --version 2>/dev/null || echo 'Not available')"
echo "Node.js: $(node --version 2>/dev/null || echo 'Not available')"
echo "npm: $(npm --version 2>/dev/null || echo 'Not available')"
echo "Python: $(python3 --version 2>/dev/null || echo 'Not available')"
echo "Git: $(git --version 2>/dev/null || echo 'Not available')"
echo "GitHub CLI: $(gh --version 2>/dev/null | head -1 || echo 'Not available')"
echo "PostgreSQL Client: $(psql --version 2>/dev/null || echo 'Not available')"
echo "Redis CLI: $(redis-cli --version 2>/dev/null || echo 'Not available')"
echo "Prisma: $(cd base-codebase 2>/dev/null && npx prisma --version 2>/dev/null || echo 'Not available')"
echo "yq: $(yq --version 2>/dev/null || echo 'Not available')"

# Check database connection
echo ""
echo "🔍 Checking database services..."
if docker ps | grep -q cryptoview-postgres; then
    echo "✅ PostgreSQL container is running"
else
    echo "❌ PostgreSQL container is not running"
fi

if docker ps | grep -q cryptoview-redis; then
    echo "✅ Redis container is running"
else
    echo "❌ Redis container is not running"
fi

echo ""
echo "✅ Blockchain Investment Dashboard setup completed!"
echo "🐳 Docker-in-Docker is available"
echo "🔧 Development tools are ready"
echo "☸️ Kubernetes tools installed via features"
echo "🏗️ Infrastructure tools available via features"
echo "🐘 PostgreSQL database is running on port 5432"
echo "🔴 Redis cache is running on port 6379"
echo "⚡ Next.js project is initialized"
echo "🔄 Prisma ORM is configured"
echo "🧠 AI/ML dependencies are installed"
echo ""
echo "🚀 To get started:"
echo "   1. Update API keys in base-codebase/.env file"
echo "   2. cd base-codebase && npm run dev"
echo "   3. Visit: http://localhost:3000"
echo ""
echo "💡 If kubectl/helm/terraform are not available, please rebuild the container"
echo "🎉 Happy coding!"
