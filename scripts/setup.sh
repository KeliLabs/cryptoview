#!/bin/bash

# Setup script for Blockchain Investment Dashboard
# Run this script to set up the project manually if needed

set -e

echo "🚀 Setting up Blockchain Investment Dashboard..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Create docker-compose file if it doesn't exist
if [ ! -f "docker-compose.dev.yml" ]; then
    echo "📄 Creating docker-compose.dev.yml..."
    cat > docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: cryptoview-postgres
    environment:
      POSTGRES_DB: crypto_dashboard
      POSTGRES_USER: cryptoview
      POSTGRES_PASSWORD: cryptoview_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: cryptoview-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
EOF
fi

# Start database services
echo "🐘 Starting database services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if package.json exists and initialize project if needed
if [ ! -f "package.json" ] || grep -q "base-codespace" package.json; then
    echo "🆕 Initializing Next.js project..."
    
    # Remove old files if they exist
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
fi

# Install additional dependencies
echo "📦 Installing project dependencies..."
npm install --save \
    @prisma/client \
    prisma \
    axios \
    chart.js \
    react-chartjs-2 \
    recharts \
    @google/generative-ai \
    redis \
    bull \
    zustand \
    @radix-ui/react-dialog \
    @radix-ui/react-dropdown-menu \
    @radix-ui/react-select \
    @radix-ui/react-toast \
    lucide-react \
    class-variance-authority \
    clsx \
    tailwind-merge

# Create environment file
if [ ! -f ".env" ]; then
    echo "⚙️ Creating environment file..."
    cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://cryptoview:cryptoview_password@localhost:5432/crypto_dashboard"

# API Keys (Update these with your actual keys)
BLOCKCHAIR_API_KEY="your_blockchair_api_key"
COINGECKO_API_KEY="your_coingecko_api_key"
GEMINI_API_KEY="your_gemini_api_key"
NEWS_API_KEY="your_news_api_key"

# Redis
REDIS_URL="redis://localhost:6379"

# Development
NODE_ENV="development"
EOF
fi

# Initialize Prisma if not already done
if [ ! -f "prisma/schema.prisma" ]; then
    echo "🔧 Initializing Prisma..."
    npx prisma init
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🚀 Pushing database schema..."
npx prisma db push

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 To start development:"
echo "   1. Update API keys in .env file"
echo "   2. Run: npm run dev"
echo "   3. Open: http://localhost:3000"
echo ""
echo "🔧 Useful commands:"
echo "   - npm run dev          # Start development server"
echo "   - npx prisma studio    # Open database GUI"
echo "   - docker-compose -f docker-compose.dev.yml down  # Stop services"
echo ""
echo "🎉 Happy coding!"
