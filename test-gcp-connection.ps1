# Test GCP Connection for pravartak-15665
# Run this after migration to verify everything is working

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing GCP Connection" -ForegroundColor Cyan
Write-Host "Project: pravartak-15665" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Change to backend directory
Set-Location backend

Write-Host "Test 1: Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" | Select-String -Pattern "GCP_PROJECT_ID|GEMINI_API_KEY|GOOGLE_APPLICATION_CREDENTIALS"
    $envContent | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`nTest 2: Checking credentials file..." -ForegroundColor Yellow
if (Test-Path "gcp-credentials.json") {
    try {
        $creds = Get-Content "gcp-credentials.json" -Raw | ConvertFrom-Json
        $projectId = $creds.project_id
        Write-Host "  Project ID: $projectId" -ForegroundColor Gray
        
        if ($projectId -eq "pravartak-15665") {
            Write-Host "✓ Credentials file is correct" -ForegroundColor Green
        } else {
            Write-Host "✗ Wrong project! Expected 'pravartak-15665', got '$projectId'" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Could not parse credentials file" -ForegroundColor Red
    }
} else {
    Write-Host "✗ gcp-credentials.json not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`nTest 3: Testing Python Google Cloud libraries..." -ForegroundColor Yellow

# Test Text-to-Speech
Write-Host "  Testing Text-to-Speech API..." -ForegroundColor Gray
$ttsTest = @"
from google.cloud import texttospeech
import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './gcp-credentials.json'
try:
    client = texttospeech.TextToSpeechClient()
    print('✓ Text-to-Speech API connected')
except Exception as e:
    print(f'✗ TTS Error: {e}')
"@

python -c $ttsTest

# Test Speech-to-Text
Write-Host "  Testing Speech-to-Text API..." -ForegroundColor Gray
$sttTest = @"
from google.cloud import speech
import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './gcp-credentials.json'
try:
    client = speech.SpeechClient()
    print('✓ Speech-to-Text API connected')
except Exception as e:
    print(f'✗ STT Error: {e}')
"@

python -c $sttTest

# Test Vertex AI
Write-Host "  Testing Vertex AI (Gemini)..." -ForegroundColor Gray
$vertexTest = @"
import vertexai
import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './gcp-credentials.json'
try:
    vertexai.init(project='pravartak-15665', location='us-central1')
    print('✓ Vertex AI connected')
except Exception as e:
    print(f'✗ Vertex AI Error: {e}')
"@

python -c $vertexTest

Write-Host "`nTest 4: Testing server startup..." -ForegroundColor Yellow
Write-Host "  Starting Flask server (press Ctrl+C to stop)..." -ForegroundColor Gray
Write-Host "  If server starts without errors, migration is successful!" -ForegroundColor Cyan
Write-Host ""

# Start the server
python server_ai_interviewer.py
