#!/bin/bash

echo "🎬 Starting Movie Dashboard..."
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
echo "✅ Movie Dashboard is running!"
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