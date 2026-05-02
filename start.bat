@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🎬 Starting MILO...
echo.

:: Check for Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed.
    echo Please install Node.js (v18+) from https://nodejs.org/
    exit /b 1
)

:: Check for npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: npm is not installed.
    echo Please install Node.js (v18+) from https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ Node.js !NODE_VERSION! and npm !NPM_VERSION! found
echo.

:: Function to install dependencies if needed
:install_if_needed
set "dir=%~1"
set "name=%~2"

if not exist "!dir!\node_modules" (
    echo 🔧 Installing !name! dependencies...
    cd !dir!
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install !name! dependencies
        cd ..
        exit /b 1
    )
    echo ✅ !name! dependencies installed successfully
    cd ..
) else (
    echo ✅ !name! dependencies already installed, skipping...
)
exit /b 0

:: Install backend dependencies if needed
call :install_if_needed "backend" "backend"
if %errorlevel% neq 0 exit /b 1

:: Install frontend dependencies if needed
call :install_if_needed "frontend" "frontend"
if %errorlevel% neq 0 exit /b 1

echo.

:: Function to cleanup processes on exit
:cleanup
echo.
echo 🛑 Stopping servers...
if defined BACKEND_PID (
    taskkill /F /PID !BACKEND_PID! >nul 2>&1
)
if defined FRONTEND_PID (
    taskkill /F /PID !FRONTEND_PID! >nul 2>&1
)
endlocal
exit /b 0

:: Set trap to cleanup on Ctrl+C
trap cleanup

:: Start backend
echo 📡 Starting backend server...
cd backend
start /B cmd /c "node server.js" >nul 2>&1

:: Capture backend PID using wmic
for /f "tokens=2" %%i in ('wmic process where "commandline like '%%node server.js%%'" get processid ^| findstr /r "[0-9]"') do (
    set BACKEND_PID=%%i
)
cd ..

:: Wait a moment for backend to start
timeout /t 2 /nobreak >nul

:: Start frontend
echo 🎨 Starting frontend server...
cd frontend
start /B cmd /c "npm run dev" >nul 2>&1

:: Capture frontend PID using wmic
for /f "tokens=2" %%i in ('wmic process where "commandline like '%%npm run dev%%'" get processid ^| findstr /r "[0-9]"') do (
    set FRONTEND_PID=%%i
)
cd ..

echo.
echo ✅ MILO is running!
echo.
echo 📱 Local access:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3000
echo.
echo 🌐 To access from other devices:
echo    1. Find your IP: ipconfig
echo    2. Access from other device: http://YOUR_IP:5173
echo    Note: API requests are now proxied automatically!
echo.
echo ⌨️  Press Ctrl+C to stop all servers
echo.

:: Wait indefinitely
:wait_loop
timeout /t 1 /nobreak >nul
goto wait_loop
