# Database Setup Script for Windows
# This script helps you set up the PostgreSQL database for local development

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Pravartak Database Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed and running
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not found"
    }
    Write-Host "[OK] Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker is not installed or not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host "After installation, make sure Docker Desktop is running and try again." -ForegroundColor Yellow
    exit 1
}

# Check if docker-compose is available
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker compose version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose not found"
    }
    Write-Host "[OK] Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker Compose is not available" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting PostgreSQL database with Docker Compose..." -ForegroundColor Yellow

# Start the database
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to start database" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Database container started" -ForegroundColor Green

# Wait for database to be ready
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if database is healthy
$healthCheck = docker compose ps postgres 2>&1
if ($healthCheck -match "healthy|running") {
    Write-Host "[OK] Database is ready" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Database is starting, please wait a moment..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Environment Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
$envFile = ".env"
$envLocalFile = ".env.local"

if (Test-Path $envLocalFile) {
    Write-Host "Found .env.local file" -ForegroundColor Green
    $envFile = $envLocalFile
} elseif (Test-Path $envFile) {
    Write-Host "Found .env file" -ForegroundColor Green
} else {
    Write-Host "No .env file found. Creating one..." -ForegroundColor Yellow
    
    # Create .env file with database configuration
    $envContent = @"
# Database Configuration
DATABASE_URL="postgresql://pravartak_user:pravartak_password@localhost:5432/pravartak"

# Firebase Configuration (Update these with your Firebase credentials)
NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"

# AI Integration
GEMINI_API_KEY="your_gemini_api_key"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Backend URL (for interview simulator)
NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:5000"
"@
    
    $envContent | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "[OK] Created $envFile file" -ForegroundColor Green
    Write-Host ""
    Write-Host "[WARNING] Please update the Firebase and Gemini API keys in $envFile" -ForegroundColor Yellow
}

# Check if DATABASE_URL is set correctly
$envContent = Get-Content $envFile -Raw
if ($envContent -match 'DATABASE_URL="postgresql://pravartak_user:pravartak_password@localhost:5432/pravartak"') {
    Write-Host "[OK] DATABASE_URL is configured correctly" -ForegroundColor Green
} else {
    Write-Host "[WARNING] DATABASE_URL might need to be updated in $envFile" -ForegroundColor Yellow
    Write-Host "  Expected: postgresql://pravartak_user:pravartak_password@localhost:5432/pravartak" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Run Prisma migrations:" -ForegroundColor White
Write-Host "   npx prisma generate" -ForegroundColor Gray
Write-Host "   npx prisma migrate dev" -ForegroundColor Gray
Write-Host ""

Write-Host "2. (Optional) Open Prisma Studio to view your database:" -ForegroundColor White
Write-Host "   npx prisma studio" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Start your development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Database Management" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "To stop the database:" -ForegroundColor White
Write-Host "   docker compose down" -ForegroundColor Gray
Write-Host ""

Write-Host "To view database logs:" -ForegroundColor White
Write-Host "   docker compose logs postgres" -ForegroundColor Gray
Write-Host ""

Write-Host "To reset the database (removes all data):" -ForegroundColor White
Write-Host "   docker compose down -v" -ForegroundColor Gray
Write-Host "   docker compose up -d" -ForegroundColor Gray
Write-Host "   npx prisma migrate dev" -ForegroundColor Gray
Write-Host ""

Write-Host "[OK] Setup complete!" -ForegroundColor Green

