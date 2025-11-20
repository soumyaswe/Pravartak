# 🎬 Start Complete Interview Simulator System
# This script starts both backend and frontend servers

Write-Host "🎭 Starting AI Interview Simulator System..." -ForegroundColor Cyan
Write-Host ""

$rootPath = "c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak"

# Function to start backend in new window
function Start-Backend {
    Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath'; .\start-backend.ps1"
}

# Function to start frontend
function Start-Frontend {
    Write-Host "⚛️  Starting Frontend Server..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Frontend will start on: http://localhost:3000" -ForegroundColor Green
    Write-Host "Navigate to: http://localhost:3000/interview-simulator" -ForegroundColor Green
    Write-Host ""
    npm run dev
}

# Start backend in new window
Start-Backend

# Wait a bit for backend to initialize
Write-Host ""
Write-Host "⏳ Waiting for backend to initialize (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend in current window
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "⚛️  Starting Next.js Frontend..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $rootPath
Start-Frontend
