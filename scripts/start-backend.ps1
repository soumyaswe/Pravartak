# 🚀 Start AI Interviewer Backend
# This script sets up and starts the Flask backend server for the talking avatar

Write-Host "🎭 Starting AI Interviewer Avatar Backend..." -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
$backendPath = "c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak\backend"
Set-Location $backendPath

# Check if virtual environment exists
if (-Not (Test-Path ".\venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Check if dependencies are installed
Write-Host "📚 Checking dependencies..." -ForegroundColor Yellow
$pipList = pip list
if ($pipList -notmatch "Flask") {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

# Check if GCP credentials exist
if (-Not (Test-Path ".\gcp-credentials.json")) {
    Write-Host "⚠️  GCP credentials not found!" -ForegroundColor Yellow
    Write-Host "Copying from root directory..." -ForegroundColor Yellow
    Copy-Item "..\flash-precept-471409-u3-0a2cc0ca3940.json" ".\gcp-credentials.json"
    if (Test-Path ".\gcp-credentials.json") {
        Write-Host "✅ GCP credentials copied" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to copy GCP credentials" -ForegroundColor Red
        Write-Host "Please manually copy flash-precept-471409-u3-0a2cc0ca3940.json to backend/gcp-credentials.json" -ForegroundColor Red
        exit 1
    }
}

# Check if root .env exists (we use a single root .env for the whole project)
if (-Not (Test-Path "..\.env")) {
    Write-Host "⚠️  Root .env file not found!" -ForegroundColor Yellow
    Write-Host "Copying from root .env.example to create a root .env..." -ForegroundColor Yellow
    Copy-Item "..\.env.example" "..\.env"
    if (Test-Path "..\.env") {
        Write-Host "✅ Root .env file created at project root" -ForegroundColor Green
        Write-Host "⚡ Please edit .env in the repository root to add your GCP_PROJECT_ID and other settings" -ForegroundColor Yellow
    }
}

# Create audio_files directory if it doesn't exist
if (-Not (Test-Path ".\audio_files")) {
    New-Item -ItemType Directory -Path ".\audio_files" | Out-Null
    Write-Host "✅ Created audio_files directory" -ForegroundColor Green
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Flask Backend Server..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server will start on: http://127.0.0.1:5000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the Flask server
python server_ai_interviewer.py
