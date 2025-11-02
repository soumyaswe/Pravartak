# Interview Simulator Backend Setup Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Interview Simulator Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create backend directory if it doesn't exist
$backendDir = "backend"
if (-not (Test-Path $backendDir)) {
    New-Item -ItemType Directory -Path $backendDir | Out-Null
    Write-Host "Created backend directory" -ForegroundColor Green
}

# Copy server file
Write-Host "Copying server files..." -ForegroundColor Yellow
try {
    Copy-Item "D:\Pravartak-S\talking_avatar\server_ai_interviewer.py" -Destination ".\backend\" -Force
    Write-Host "Copied server_ai_interviewer.py" -ForegroundColor Green
} catch {
    Write-Host "Could not copy server_ai_interviewer.py" -ForegroundColor Red
}

# Copy requirements
try {
    Copy-Item "D:\Pravartak-S\talking_avatar\requirements.txt" -Destination ".\backend\" -Force
    Write-Host "Copied requirements.txt" -ForegroundColor Green
} catch {
    Write-Host "Could not copy requirements.txt" -ForegroundColor Red
}

# Copy GCP credentials
try {
    Copy-Item "D:\Pravartak-S\talking_avatar\gcp-credentials.json" -Destination ".\backend\" -Force
    Write-Host "Copied gcp-credentials.json" -ForegroundColor Green
} catch {
    Write-Host "Could not copy gcp-credentials.json" -ForegroundColor Red
}

# Create .env file
$envContent = @"
GCP_PROJECT_ID=your-google-cloud-project-id
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
PORT=5000
"@

Set-Content -Path ".\backend\.env" -Value $envContent
Write-Host "Created .env file (remember to update GCP_PROJECT_ID!)" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Update backend\.env with your GCP_PROJECT_ID" -ForegroundColor Yellow
Write-Host "2. cd backend" -ForegroundColor Yellow
Write-Host "3. python -m venv venv" -ForegroundColor Yellow
Write-Host "4. .\venv\Scripts\Activate" -ForegroundColor Yellow
Write-Host "5. pip install -r requirements.txt" -ForegroundColor Yellow
Write-Host "6. python server_ai_interviewer.py" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then start your Next.js app and navigate to /interview-simulator!" -ForegroundColor Green
