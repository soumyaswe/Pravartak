# Migration Guide: Moving to pravartak-15665 GCP Project

## Current Issue
Your interview simulator is not working because it's configured to use the `flash-precept-471409-u3` GCP project, but you want everything to run from `pravartak-15665`.

## Prerequisites Checklist

### 1. Create Service Account in pravartak-15665
- [ ] Go to [GCP Console](https://console.cloud.google.com)
- [ ] Select project: `pravartak-15665`
- [ ] Navigate to: IAM & Admin → Service Accounts
- [ ] Click "Create Service Account"
- [ ] Name: `pravartak-ai-services`
- [ ] Grant these roles:
  - Cloud Text-to-Speech Admin
  - Cloud Speech-to-Text Admin
  - Vertex AI User
- [ ] Click "Create Key" → JSON
- [ ] Save as: `pravartak-15665-credentials.json` in project root

### 2. Enable Required APIs
In GCP Console for `pravartak-15665`:
- [ ] Enable Cloud Text-to-Speech API
- [ ] Enable Cloud Speech-to-Text API  
- [ ] Enable Vertex AI API
- [ ] Enable Cloud Speech API

Go to: [API Library](https://console.cloud.google.com/apis/library)

### 3. Get New Gemini API Key
- [ ] Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] Switch to project `pravartak-15665`
- [ ] Create new API key
- [ ] Copy the key

## Files to Update

Once you have the credentials file and API key, update these files:

### 1. Root `.env` file
Update line 31 with new credentials path:
```
GOOGLE_APPLICATION_CREDENTIALS="./pravartak-15665-credentials.json"
```

Update line 20 with new Gemini API key:
```
GEMINI_API_KEY="YOUR_NEW_API_KEY_HERE"
```

### 2. Backend `.env` file
Update with new project details:
```
GCP_PROJECT_ID=pravartak-15665
GOOGLE_APPLICATION_CREDENTIALS=./pravartak-15665-credentials.json
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
```

### 3. Place credentials files
- [ ] Copy `pravartak-15665-credentials.json` to project root
- [ ] Copy `pravartak-15665-credentials.json` to `backend/` folder (rename to `gcp-credentials.json`)

## Verification Steps

After making changes:

1. **Test Backend Connection**
   ```powershell
   cd backend
   python -c "from google.cloud import texttospeech; client = texttospeech.TextToSpeechClient(); print('✓ TTS Connected')"
   ```

2. **Test Vertex AI**
   ```powershell
   python -c "import vertexai; vertexai.init(project='pravartak-15665', location='us-central1'); print('✓ Vertex AI Connected')"
   ```

3. **Start Backend Server**
   ```powershell
   cd backend
   python server_ai_interviewer.py
   ```

4. **Test Interview Simulator**
   - Navigate to http://localhost:3000/interview-simulator
   - Select a position
   - Click "Start Interview"
   - Verify avatar starts speaking

## Common Issues

### Issue: "Could not automatically determine credentials"
**Solution**: Ensure `GOOGLE_APPLICATION_CREDENTIALS` path is correct and file exists

### Issue: "API not enabled"
**Solution**: Enable all required APIs in GCP Console for `pravartak-15665`

### Issue: "Permission denied"
**Solution**: Verify service account has all required roles

### Issue: "Invalid API key"
**Solution**: Generate a new Gemini API key for the correct project

## Rollback Plan

If something goes wrong, you can revert by:
1. Restore original `.env` files from backup
2. Use the old credentials file

## Notes
- Keep both credentials files for now (old and new) in case of issues
- Test thoroughly in development before removing old credentials
- Update any CI/CD pipelines with new credentials
