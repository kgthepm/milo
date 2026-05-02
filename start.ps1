$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root 'backend'
$frontendDir = Join-Path $root 'frontend'

Write-Host 'Starting Cine-Metric...'
Write-Host ''

Write-Host 'Installing backend dependencies...'
& npm install --prefix $backendDir

Write-Host ''
Write-Host 'Installing frontend dependencies...'
& npm install --prefix $frontendDir

Write-Host ''
Write-Host 'Starting backend server...'
Start-Process -FilePath 'powershell.exe' -WorkingDirectory $backendDir -ArgumentList '-NoExit', '-Command', 'npm start'

Write-Host 'Starting frontend server...'
Start-Process -FilePath 'powershell.exe' -WorkingDirectory $frontendDir -ArgumentList '-NoExit', '-Command', 'npm run dev'

Write-Host ''
Write-Host 'Cine-Metric is running.'
Write-Host ''
Write-Host 'Local access:'
Write-Host '  Frontend: http://localhost:5173'
Write-Host '  Backend:  http://localhost:3000'
Write-Host ''
Write-Host 'To access from other devices:'
Write-Host '  1. Find your IP: ipconfig'
Write-Host '  2. Access from other device: http://YOUR_IP:5173'
Write-Host '  Note: API requests are proxied automatically.'
Write-Host ''
Write-Host 'Use Ctrl+C in each server window to stop the app.'
