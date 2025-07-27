#!/bin/bash

# Web3 Chat Room Development Setup Script

echo "🛠️  Setting up Web3 Chat Room for development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing all dependencies..."
npm run install:all

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.local.example .env.local 2>/dev/null || echo "# Create your .env.local file with the required environment variables" > .env.local
fi

# Create server .env if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env not found. Creating..."
    echo "PORT=3001" > server/.env
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update .env.local with your configuration:"
echo "   - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"
echo "   - NEXT_PUBLIC_IPFS_AUTH"
echo ""
echo "2. Start development servers:"
echo "   npm run dev:all"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🔗 Useful commands:"
echo "   npm run dev          # Start frontend only"
echo "   npm run dev:server   # Start server only"
echo "   npm run dev:all      # Start both frontend and server"
echo "   npm run build        # Build for production"
echo ""
