@echo off
setlocal

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo Starting Cine-Metric...
echo.

where npm >nul 2>&1
if errorlevel 1 goto :npm_missing

echo Installing backend dependencies...
call npm install --prefix "%ROOT%\backend"
if errorlevel 1 goto :install_failed

echo.
echo Installing frontend dependencies...
call npm install --prefix "%ROOT%\frontend"
if errorlevel 1 goto :install_failed

echo.
echo Starting backend server...
start "Cine-Metric Backend" /D "%ROOT%\backend" cmd /k npm start

echo Starting frontend server...
start "Cine-Metric Frontend" /D "%ROOT%\frontend" cmd /k npm run dev

echo.
echo Cine-Metric is running.
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo.
echo Use Ctrl+C in each server window to stop the app.
exit /b 0

:install_failed
echo.
echo Failed while installing dependencies.
exit /b %errorlevel%

:npm_missing
echo.
echo npm was not found in PATH. Install Node.js, then try again.
exit /b 1
