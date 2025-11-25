# Firebase App Hosting - Secret Setup Script
# Project: pravartak-15665

param([switch]$Interactive)

$PROJECT_ID = "pravartak-15665"
$ErrorActionPreference = "Continue"

function Write-Step {
    param($Number, $Title)
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "Step $Number : $Title" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
}

function Set-FirebaseSecret {
    param(
        [string]$SecretName,
        [string]$Description,
        [string]$Example
    )
    
    Write-Host ""
    Write-Host "Secret: $SecretName" -ForegroundColor Green
    Write-Host "Description: $Description" -ForegroundColor Gray
    if ($Example) {
        Write-Host "Example: $Example" -ForegroundColor DarkGray
    }
    
    $cmd = "echo `"your-value`" | gcloud secrets create $SecretName --project=$PROJECT_ID --data-file=-"
    Write-Host "Command:" -ForegroundColor Yellow
    Write-Host "  $cmd" -ForegroundColor White
    
    if ($Interactive) {
        $value = Read-Host "Enter value for $SecretName (or press Enter to skip)"
        if ($value) {
            try {
                $value | gcloud secrets create $SecretName --project=$PROJECT_ID --data-file=-
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "Success: Created $SecretName" -ForegroundColor Green
                } else {
                    Write-Host "Failed to create $SecretName" -ForegroundColor Red
                }
            } catch {
                Write-Host "Error: $_" -ForegroundColor Red
            }
        }
    }
}

Clear-Host
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Firebase Secrets Configuration Assistant" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Yellow
Write-Host ""

$gcloudInstalled = Get-Command gcloud -ErrorAction SilentlyContinue
if (-not $gcloudInstalled) {
    Write-Host "ERROR: gcloud CLI not found!" -ForegroundColor Red
    Write-Host "Install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    Write-Host "Or: choco install gcloudsdk" -ForegroundColor Yellow
    exit 1
}

Write-Host "gcloud CLI detected" -ForegroundColor Green

Write-Step 1 "Enable Secret Manager API"
$enableCmd = "gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID"
Write-Host $enableCmd -ForegroundColor White

if ($Interactive) {
    $response = Read-Host "`nRun this command? (Y/N)"
    if ($response -eq 'Y') {
        Invoke-Expression $enableCmd
    }
}

Write-Step 2 "Set Required Secrets"
Write-Host ""
Write-Host "REQUIRED secrets:" -ForegroundColor Green

Set-FirebaseSecret -SecretName "DATABASE_URL" -Description "PostgreSQL connection string" -Example "postgresql://user:pass@host:5432/db"

Set-FirebaseSecret -SecretName "GEMINI_API_KEY" -Description "Google AI API Key" -Example "AIzaSyD..."

Set-FirebaseSecret -SecretName "NEXT_PUBLIC_FIREBASE_API_KEY" -Description "Firebase Web API Key" -Example "AIzaSyC..."

Write-Step 3 "Set Optional Secrets"
Write-Host ""
Write-Host "OPTIONAL secrets:" -ForegroundColor Yellow

Set-FirebaseSecret -SecretName "NEXT_PUBLIC_BACKEND_URL" -Description "Backend API URL" -Example "https://api.example.com"

Write-Step 4 "Verify Secrets"
$listCmd = "gcloud secrets list --project=$PROJECT_ID"
Write-Host $listCmd -ForegroundColor White

if ($Interactive) {
    $response = Read-Host "`nList all secrets? (Y/N)"
    if ($response -eq 'Y') {
        Invoke-Expression $listCmd
    }
}

Write-Step 5 "Update Existing Secrets"
Write-Host ""
Write-Host "To update a secret:" -ForegroundColor White
Write-Host "  echo `"new-value`" | gcloud secrets versions add SECRET_NAME --project=$PROJECT_ID --data-file=-" -ForegroundColor Gray
Write-Host ""
Write-Host "Example:" -ForegroundColor Yellow
Write-Host "  echo `"new-url`" | gcloud secrets versions add DATABASE_URL --project=$PROJECT_ID --data-file=-" -ForegroundColor White

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Quick Reference" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Where to get values:" -ForegroundColor Yellow
Write-Host "  DATABASE_URL ....... PostgreSQL provider (Neon, Supabase)" -ForegroundColor White
Write-Host "  GEMINI_API_KEY ..... https://makersuite.google.com/app/apikey" -ForegroundColor White
Write-Host "  FIREBASE_API_KEY ... Firebase Console > Settings > General" -ForegroundColor White
Write-Host ""
Write-Host "Common commands:" -ForegroundColor Yellow
Write-Host "  List ....... gcloud secrets list --project=$PROJECT_ID" -ForegroundColor White
Write-Host "  View ....... gcloud secrets versions access latest --secret=NAME --project=$PROJECT_ID" -ForegroundColor White
Write-Host "  Delete ..... gcloud secrets delete NAME --project=$PROJECT_ID" -ForegroundColor White
Write-Host ""

if (-not $Interactive) {
    Write-Host "Tip: Run with -Interactive to execute commands:" -ForegroundColor Yellow
    Write-Host "  .\setup-firebase-secrets-new.ps1 -Interactive" -ForegroundColor White
    Write-Host ""
}