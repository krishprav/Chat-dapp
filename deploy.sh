#!/bin/bash

# Web3 Chat Room Deployment Script

echo "🚀 Starting Web3 Chat Room deployment..."

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not set"
fi

if [ -z "$NEXT_PUBLIC_IPFS_AUTH" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_IPFS_AUTH not set"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Start the server in production mode
echo "🎯 Starting production server..."
cd server
npm start &

# Start the frontend in production mode
echo "🌐 Starting frontend..."
cd ..
npm start

echo "✅ Deployment complete!"
echo "🌍 Frontend: http://localhost:3000"
echo "⚡ WebSocket: http://localhost:3001"
