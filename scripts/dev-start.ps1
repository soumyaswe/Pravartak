<#
Dev helper: set GOOGLE_APPLICATION_CREDENTIALS and start the Python backend.

Usage: from repo root in PowerShell
  .\scripts\dev-start.ps1

This sets the env var for the session, ensures the JSON exists, and runs the backend.
Do NOT commit service account JSON files. Keep them under a gitignored folder like `secrets/`.
#>

Param()

$root = Get-Location
$jsonPath = Join-Path $root.Path 'pravartak-15665-796c53f73f09.json'

if (-not (Test-Path $jsonPath)) {
    Write-Host "Service account JSON not found at: $jsonPath" -ForegroundColor Yellow
    Write-Host "If your JSON is elsewhere, move it to the repo root or update the script." -ForegroundColor Yellow
    exit 1
}

Write-Host "Setting GOOGLE_APPLICATION_CREDENTIALS to $jsonPath" -ForegroundColor Green
$env:GOOGLE_APPLICATION_CREDENTIALS = $jsonPath

Write-Host "Starting backend... (Python will use the service account credentials)" -ForegroundColor Green
python backend\server_ai_interviewer.py
