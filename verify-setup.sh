#!/bin/bash

echo "🔧 Web3 Chat Room - Build Verification"
echo "======================================"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Are you in the right directory?"
    exit 1
fi

echo "✅ package.json found"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
fi

echo "✅ Dependencies installed"

# Check if server dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "⚠️  Server dependencies not found. Installing..."
    cd server && npm install && cd ..
fi

echo "✅ Server dependencies installed"

# Check critical files
critical_files=(
    "src/app/page.tsx"
    "src/lib/ipfs.ts"
    "src/lib/web3.ts"
    "server/index.js"
)

for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Critical file missing: $file"
        exit 1
    fi
done

echo "✅ All critical files present"

# Try to build the project
echo ""
echo "🏗️  Testing build process..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 BUILD SUCCESS!"
    echo ""
    echo "✅ Your Web3 Chat Room is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Update .env.local with your configuration"
    echo "2. Run: npm run dev:all"
    echo "3. Open: http://localhost:3000"
else
    echo ""
    echo "❌ BUILD FAILED!"
    echo ""
    echo "Please check the error messages above."
    echo "Common issues:"
    echo "- Missing environment variables"
    echo "- Dependency conflicts"
    echo "- TypeScript errors"
fi
