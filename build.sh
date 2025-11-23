#!/bin/bash

echo "🔬 VIVARIUM Build Script"
echo "========================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo "✓ npm found: $(npm --version)"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Parse command line arguments
BUILD_TARGET="$1"

if [ -z "$BUILD_TARGET" ]; then
    echo "🏗️  Building for current platform..."
    npm run build
elif [ "$BUILD_TARGET" == "all" ]; then
    echo "🏗️  Building for all platforms (Linux, Windows, macOS)..."
    npm run build:all
elif [ "$BUILD_TARGET" == "linux" ]; then
    echo "🏗️  Building for Linux..."
    npm run build:linux
elif [ "$BUILD_TARGET" == "win" ] || [ "$BUILD_TARGET" == "windows" ]; then
    echo "🏗️  Building for Windows..."
    npm run build:win
elif [ "$BUILD_TARGET" == "mac" ] || [ "$BUILD_TARGET" == "macos" ]; then
    echo "🏗️  Building for macOS..."
    npm run build:mac
else
    echo "❌ Unknown build target: $BUILD_TARGET"
    echo ""
    echo "Usage: ./build.sh [target]"
    echo ""
    echo "Targets:"
    echo "  (none)   - Build for current platform"
    echo "  all      - Build for all platforms"
    echo "  linux    - Build for Linux (AppImage, deb)"
    echo "  win      - Build for Windows (installer, portable)"
    echo "  mac      - Build for macOS (dmg, zip)"
    exit 1
fi

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Output directory: dist/"
ls -lh dist/ 2>/dev/null || echo "   (No files yet - build may have failed)"
echo ""
echo "🚀 To run the app in development mode:"
echo "   npm start"
echo ""
