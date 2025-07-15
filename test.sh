if [ -d "base-codebase" ]; then
    echo "📁 Found base-codebase directory, working within it..."
    cd base-codebase
elif [ -f "package.json" ]; then
    echo "📦 Found package.json in root, checking if it's the base template..."
    if grep -q "base-codespace" package.json; then
        echo "🔄 Detected base template, initializing Next.js project..."
        
        # Remove the basic server.js and package files
        
        echo "✅ Next.js project initialized"
    else
        echo "ℹ️ Custom package.json detected, installing dependencies..."
    fi
else
    echo "🆕 No package.json found, creating Next.js project..."
    
fi
if [ ! -f "prisma/schema.prisma" ]; then
    echo "🔧 Initializing Prisma ORM..."
    # npx prisma init
else
    ls
    echo "✅ Prisma already initialized"
fi
if [ -f ".env.example" ]; then
    echo "⚙️ Creating environment variables template..."
fi
if [ ! -d "node_modules/@prisma/client" ] || [ ! -f "node_modules/.prisma/client/index.js" ]; then
    echo "🔄 Generating Prisma client..."
    # npx prisma generate
else
    echo "✅ Prisma client already generated"
fi

if ! python3 -c "import pandas, numpy, requests, redis, psycopg2, google.generativeai" 2>/dev/null; then
    echo "🐍 Installing Python dependencies..."
else
    echo "✅ Python dependencies already installed"
fi