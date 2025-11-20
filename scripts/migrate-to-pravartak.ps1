# Migration Script for GCP Project Switch
# This script helps migrate from flash-precept-471409-u3 to pravartak-15665

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GCP Project Migration Helper" -ForegroundColor Cyan
Write-Host "From: flash-precept-471409-u3" -ForegroundColor Yellow
Write-Host "To: pravartak-15665" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if running from correct directory
if (-not (Test-Path ".\backend")) {
    Write-Host "ERROR: Please run this script from the project root directory (where backend folder exists)" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow

# Check for new credentials file
$newCredsFile = ".\pravartak-15665-credentials.json"
if (-not (Test-Path $newCredsFile)) {
    Write-Host "`n⚠️  MISSING: $newCredsFile" -ForegroundColor Red
    Write-Host "`nPlease complete these steps first:" -ForegroundColor Yellow
    Write-Host "1. Go to Google Cloud Console" -ForegroundColor White
    Write-Host "2. Select project 'pravartak-15665'" -ForegroundColor White
    Write-Host "3. Create service account with required roles" -ForegroundColor White
    Write-Host "4. Download JSON key as 'pravartak-15665-credentials.json'" -ForegroundColor White
    Write-Host "5. Place it in the project root directory" -ForegroundColor White
    Write-Host "`nSee MIGRATION_TO_PRAVARTAK_15665.md for detailed instructions`n" -ForegroundColor Cyan
    exit 1
} else {
    Write-Host "✓ Found new credentials file" -ForegroundColor Green
}

# Validate JSON format
try {
    $credsContent = Get-Content $newCredsFile -Raw | ConvertFrom-Json
    $projectId = $credsContent.project_id
    
    if ($projectId -ne "pravartak-15665") {
        Write-Host "`n⚠️  WARNING: Credentials file is for project '$projectId', not 'pravartak-15665'" -ForegroundColor Red
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -ne "y") {
            exit 1
        }
    } else {
        Write-Host "✓ Credentials file verified for pravartak-15665" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not parse credentials file. Please verify it's valid JSON" -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 2: Backing up existing configuration..." -ForegroundColor Yellow

# Backup existing .env files
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = ".\backup_$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

if (Test-Path ".\.env") {
    Copy-Item ".\.env" "$backupDir\.env.backup"
    Write-Host "✓ Backed up root .env" -ForegroundColor Green
}

if (Test-Path ".\backend\.env") {
    Copy-Item ".\backend\.env" "$backupDir\backend.env.backup"
    Write-Host "✓ Backed up backend .env" -ForegroundColor Green
}

# Backup old credentials
if (Test-Path ".\flash-precept-471409-u3-0a2cc0ca3940.json") {
    Copy-Item ".\flash-precept-471409-u3-0a2cc0ca3940.json" "$backupDir\"
    Write-Host "✓ Backed up old credentials" -ForegroundColor Green
}

if (Test-Path ".\backend\gcp-credentials.json") {
    Copy-Item ".\backend\gcp-credentials.json" "$backupDir\"
    Write-Host "✓ Backed up backend credentials" -ForegroundColor Green
}

Write-Host "`nBackups saved to: $backupDir" -ForegroundColor Cyan

Write-Host "`nStep 3: Getting new Gemini API key..." -ForegroundColor Yellow
Write-Host "Please enter your NEW Gemini API key for pravartak-15665" -ForegroundColor White
Write-Host "(Get it from: https://makersuite.google.com/app/apikey)" -ForegroundColor Gray
$geminiKey = Read-Host "Gemini API Key"

if ([string]::IsNullOrWhiteSpace($geminiKey)) {
    Write-Host "⚠️  No API key provided. You'll need to update it manually later." -ForegroundColor Yellow
    $geminiKey = "YOUR_NEW_GEMINI_API_KEY_HERE"
}

Write-Host "`nStep 4: Updating configuration files..." -ForegroundColor Yellow

# Update root .env
$rootEnvContent = Get-Content ".\.env.new" -Raw
$rootEnvContent = $rootEnvContent -replace "YOUR_NEW_GEMINI_API_KEY_FOR_PRAVARTAK_15665", $geminiKey
Set-Content ".\.env" -Value $rootEnvContent
Write-Host "✓ Updated root .env file" -ForegroundColor Green

# Update backend .env
$backendEnvContent = Get-Content ".\backend\.env.new" -Raw
$backendEnvContent = $backendEnvContent -replace "YOUR_NEW_GEMINI_API_KEY_HERE", $geminiKey
Set-Content ".\backend\.env" -Value $backendEnvContent
Write-Host "✓ Updated backend .env file" -ForegroundColor Green

# Credentials handling: DO NOT copy service account JSON into the repository
Write-Host "\nIMPORTANT: Do NOT commit service-account JSON into the repository." -ForegroundColor Yellow
$uploadChoice = Read-Host "Upload this key to Google Secret Manager now? (y/N)"
if ($uploadChoice -eq 'y') {
    $secretName = Read-Host "Enter Secret Manager secret name (example: pravartak-gcp-key)"
    try {
        # Try creating the secret; ignore error if it already exists
        gcloud secrets create $secretName --data-file=$newCredsFile --project=$projectId 2>$null
        Write-Host "✓ Created secret '$secretName' and uploaded the key" -ForegroundColor Green
    } catch {
        # If secret exists, add a new version instead
        Write-Host "Secret may already exist. Adding a new secret version..." -ForegroundColor Yellow
        gcloud secrets versions add $secretName --data-file=$newCredsFile --project=$projectId
        Write-Host "✓ Added new secret version for '$secretName'" -ForegroundColor Green
    }
    Write-Host "Note: Update your deployment to read the service account from Secret Manager instead of a file." -ForegroundColor Cyan
} else {
    Write-Host "Skipping upload. If you need to test locally, copy the JSON to a local path that is gitignored (DO NOT commit it)." -ForegroundColor Yellow
}

Write-Host "`nStep 5: Verifying setup..." -ForegroundColor Yellow

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Python not found. Please install Python to test the backend." -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Migration Complete! ✓" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Verify APIs are enabled in GCP Console for pravartak-15665:" -ForegroundColor White
Write-Host "   - Cloud Text-to-Speech API" -ForegroundColor Gray
Write-Host "   - Cloud Speech-to-Text API" -ForegroundColor Gray
Write-Host "   - Vertex AI API" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test the backend server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   python server_ai_interviewer.py" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test the interview simulator:" -ForegroundColor White
Write-Host "   Navigate to http://localhost:3000/interview-simulator" -ForegroundColor Gray
Write-Host ""
Write-Host "4. If everything works, you can delete the old credentials:" -ForegroundColor White
Write-Host "   - flash-precept-471409-u3-0a2cc0ca3940.json" -ForegroundColor Gray
Write-Host ""
Write-Host "Backup location: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you encounter issues, see MIGRATION_TO_PRAVARTAK_15665.md" -ForegroundColor Yellow
