# Firebase App Hosting - Secret Setup Script
# Project: pravartak-15665

$PROJECT_ID = "pravartak-15665"
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Firebase App Hosting - Secrets Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project: $PROJECT_ID" -ForegroundColor Yellow
Write-Host ""

# Check if gcloud is available
if (!(Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: gcloud CLI is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    Write-Host "Or run: choco install gcloudsdk" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "Checking authentication..." -ForegroundColor Gray
gcloud config set project $PROJECT_ID 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not authenticated with gcloud" -ForegroundColor Red
    Write-Host "Run: gcloud auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "OK: Authenticated" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Function to set secret
function Set-Secret {
    param(
        [string]$Name,
        [string]$Description,
        [bool]$Required = $true
    )
    
    Write-Host "Secret: $Name" -ForegroundColor Yellow
    Write-Host "  $Description" -ForegroundColor Gray
    $value = Read-Host "  Enter value (or press Enter to skip)"
    
    if ([string]::IsNullOrWhiteSpace($value)) {
        if ($Required) {
            Write-Host "  WARNING: This secret is required!" -ForegroundColor Red
        }
        else {
            Write-Host "  Skipped" -ForegroundColor Gray
        }
        return
    }
    
    Write-Host "  Setting secret..." -ForegroundColor Gray
    
    # Try to create, if exists then update
    $value | gcloud secrets create $Name --project=$PROJECT_ID --data-file=- 2>&1 | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        # Secret exists, add new version
        $value | gcloud secrets versions add $Name --project=$PROJECT_ID --data-file=- 2>&1 | Out-Null
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK: Secret set successfully" -ForegroundColor Green
    }
    else {
        Write-Host "  ERROR: Failed to set secret" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "REQUIRED SECRETS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Gray
Write-Host ""

Set-Secret -Name "DATABASE_URL" -Description "PostgreSQL connection string" -Required $true
Set-Secret -Name "GEMINI_API_KEY" -Description "Google AI Gemini API key" -Required $true
Set-Secret -Name "NEXT_PUBLIC_FIREBASE_API_KEY" -Description "Firebase Web API Key" -Required $true

Write-Host ""
Write-Host "OPTIONAL SECRETS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Gray
Write-Host ""

Set-Secret -Name "NEXT_PUBLIC_BACKEND_URL" -Description "Python backend URL" -Required $false
Set-Secret -Name "GOOGLE_APPLICATION_CREDENTIALS" -Description "Service account JSON path" -Required $false

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "SETUP COMPLETE" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Deploy: firebase deploy --only hosting" -ForegroundColor White
Write-Host "  2. View secrets: gcloud secrets list --project=$PROJECT_ID" -ForegroundColor White
Write-Host ""
Write-Host "To view your secrets:" -ForegroundColor Yellow
Write-Host "  gcloud secrets list --project=$PROJECT_ID" -ForegroundColor White
Write-Host ""
