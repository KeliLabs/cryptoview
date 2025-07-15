#!/bin/bash

# Helper script to run commands in the correct project directory
# Usage: ./dev-helper.sh [command]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/../base-codebase"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: base-codebase directory not found at $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

if [ $# -eq 0 ]; then
    echo "🚀 Available commands:"
    echo "   dev        - Start development server"
    echo "   build      - Build the project"
    echo "   prisma     - Run Prisma commands"
    echo "   install    - Install dependencies"
    echo "   shell      - Open shell in project directory"
    echo ""
    echo "Usage: ./dev-helper.sh [command]"
    echo "   or: ./dev-helper.sh shell"
    exit 0
fi

case "$1" in
    "dev")
        echo "🚀 Starting development server..."
        npm run dev
        ;;
    "build")
        echo "🔨 Building project..."
        npm run build
        ;;
    "prisma")
        shift
        echo "🔄 Running Prisma command: $@"
        npx prisma "$@"
        ;;
    "install")
        echo "📦 Installing dependencies..."
        npm install
        ;;
    "shell")
        echo "🐚 Opening shell in project directory: $PROJECT_DIR"
        exec bash
        ;;
    *)
        echo "🔄 Running custom command: $@"
        "$@"
        ;;
esac
