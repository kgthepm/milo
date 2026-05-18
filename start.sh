#!/bin/bash

cd "$(dirname "$(readlink -f "$0")")" || {
    echo "❌ Could not cd to script directory"
    read -n 1 -s -r -p "Press any key to exit..."
    exit 1
}

echo "🎬 Starting MILO..."
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "Please install Node.js (v18+) from https://nodejs.org/"
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed."
    echo "Please install Node.js (v18+) from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) and npm $(npm --version) found"
echo ""

# Function to install dependencies if needed
install_if_needed() {
    local dir=$1
    local name=$2
    
    if [ ! -d "$dir/node_modules" ]; then
        echo "🔧 Installing $name dependencies..."
        cd "$dir"
        if npm install; then
            echo "✅ $name dependencies installed successfully"
            cd ..
            return 0
        else
            echo "❌ Failed to install $name dependencies"
            cd ..
            return 1
        fi
    else
        echo "✅ $name dependencies already installed, skipping..."
        return 0
    fi
}

# Install backend dependencies if needed
if ! install_if_needed "backend" "backend"; then
    exit 1
fi

# Install frontend dependencies if needed
if ! install_if_needed "frontend" "frontend"; then
    exit 1
fi

echo ""

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup SIGINT SIGTERM

# Start backend
echo "📡 Starting backend server..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ MILO is running!"
echo ""
echo "📱 Local access:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo ""
echo "🌐 To access from other devices:"
echo "   1. Find your IP: ip addr show | grep inet"
echo "   2. Access from other device: http://YOUR_IP:5173"
echo "   Note: API requests are now proxied automatically!"
echo ""
echo "⌨️  Press Ctrl+C to stop all servers"
echo ""

# Wait for both processes
wait