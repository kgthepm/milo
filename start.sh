#!/bin/bash

set -e

BACKEND_PID=""
FRONTEND_PID=""

echo "🎬 Starting Cine-Metric..."
echo ""

cleanup() {
    echo ""
    echo "🛑 Stopping servers..."

    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi

    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi

    exit 0
}

trap cleanup SIGINT SIGTERM

echo "📦 Installing backend dependencies..."
npm install --prefix backend
echo ""

echo "📦 Installing frontend dependencies..."
npm install --prefix frontend
echo ""

echo "📡 Starting backend server..."
(cd backend && npm start) &
BACKEND_PID=$!

sleep 2

echo "🎨 Starting frontend server..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "✅ Cine-Metric is running!"
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
