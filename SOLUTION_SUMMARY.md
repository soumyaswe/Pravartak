# GCP Credentials Conflict - Analysis & Solution

## Problem Summary

Your interview simulator is not working because of **GCP credential conflicts**:

### Current State
- ❌ Backend configured for: `flash-precept-471409-u3`
- ❌ Main app configured for: `flash-precept-471409-u3`  
- ❌ You want everything to use: `pravartak-15665`
- ❌ Credentials mismatch causing API failures
- ❌ Interviewer not initiating conversation or taking input

### Root Causes
1. **Wrong Project ID**: All config files point to `flash-precept-471409-u3` instead of `pravartak-15665`
2. **Wrong Credentials**: Service account is from the wrong GCP project
3. **Wrong API Keys**: Gemini API key is tied to the wrong project
4. **Missing APIs**: Required APIs might not be enabled in `pravartak-15665`

---

## Solution Overview

You need to:
1. ✅ Create service account in `pravartak-15665`
2. ✅ Enable required GCP APIs
3. ✅ Get new Gemini API key
4. ✅ Update all configuration files
5. ✅ Test the connection

---

## Quick Start Guide

### Step 1: Get Credentials from pravartak-15665

#### 1.1 Create Service Account
```
1. Go to: https://console.cloud.google.com
2. Select Project: pravartak-15665
3. Navigate: IAM & Admin → Service Accounts
4. Click: CREATE SERVICE ACCOUNT
5. Name: pravartak-ai-services
6. Description: Service account for AI interview simulator
7. Click: CREATE AND CONTINUE
```

#### 1.2 Grant Permissions
Add these roles:
- ✅ **Cloud Text-to-Speech Admin**
- ✅ **Cloud Speech-to-Text Admin**
- ✅ **Vertex AI User**

Click: CONTINUE → DONE

#### 1.3 Create Key
```
1. Click on the newly created service account
2. Go to: KEYS tab
3. Click: ADD KEY → Create new key
4. Select: JSON
5. Click: CREATE
6. Save file as: pravartak-15665-credentials.json
7. Move file to your project root: D:\Pravartak-S\Pravartak\
```

### Step 2: Enable APIs in pravartak-15665

Go to: https://console.cloud.google.com/apis/library

Enable these APIs:
- ✅ Cloud Text-to-Speech API
- ✅ Cloud Speech-to-Text API
- ✅ Vertex AI API
- ✅ Cloud Speech API

### Step 3: Get Gemini API Key

```
1. Go to: https://makersuite.google.com/app/apikey
2. Make sure you're in project: pravartak-15665
3. Click: Create API Key
4. Select: pravartak-15665 (or create in new project)
5. Copy the API key
```

### Step 4: Run Migration Script

Open PowerShell in your project root and run:

```powershell
cd D:\Pravartak-S\Pravartak
.\migrate-to-pravartak.ps1
```

The script will:
- ✅ Backup existing configuration
- ✅ Update `.env` files
- ✅ Copy credentials to backend
- ✅ Prompt for Gemini API key

### Step 5: Test the Setup

```powershell
.\test-gcp-connection.ps1
```

This will verify:
- ✅ Environment variables are correct
- ✅ Credentials file is valid
- ✅ Text-to-Speech API connection
- ✅ Speech-to-Text API connection
- ✅ Vertex AI (Gemini) connection
- ✅ Flask server starts successfully

### Step 6: Start Your Application

#### Terminal 1: Backend Server
```powershell
cd backend
python server_ai_interviewer.py
```

You should see:
```
✓ Text-to-Speech client initialized
✓ Speech-to-Text client initialized
✓ Vertex AI initialized for project: pravartak-15665
Server running on http://127.0.0.1:5000
```

#### Terminal 2: Next.js Frontend
```powershell
npm run dev
```

#### Test Interview Simulator
```
1. Open: http://localhost:3000/interview-simulator
2. Select a position (e.g., "Software Engineer")
3. Click: "Start Interview"
4. Avatar should start speaking
5. Click microphone to respond
```

---

## Files Modified

### Created Files
- ✅ `MIGRATION_TO_PRAVARTAK_15665.md` - Detailed migration guide
- ✅ `migrate-to-pravartak.ps1` - Automated migration script
- ✅ `test-gcp-connection.ps1` - Connection testing script
- ✅ `.env.new` - Template for root .env
- ✅ `backend/.env.new` - Template for backend .env
- ✅ `SOLUTION_SUMMARY.md` - This file

### Files to Update (automatically done by script)
- ✅ `.env` - Root environment variables
- ✅ `backend/.env` - Backend environment variables
- ✅ `backend/gcp-credentials.json` - Service account key

### Files to Create (YOU need to do this)
- ⚠️ `pravartak-15665-credentials.json` - Get from GCP Console

---

## Manual Configuration (Alternative)

If you prefer to update manually instead of using the script:

### Update Root `.env`
```env
# Change line 27
GOOGLE_CLOUD_PROJECT_ID="pravartak-15665"

# Change line 31  
GOOGLE_APPLICATION_CREDENTIALS="./pravartak-15665-credentials.json"

# Change line 20
GEMINI_API_KEY="YOUR_NEW_API_KEY_HERE"
```

### Update `backend/.env`
```env
# Change these lines
GCP_PROJECT_ID=pravartak-15665
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
```

### Copy Credentials
```powershell
# Copy to root
copy pravartak-15665-credentials.json .

# Copy to backend (rename)
copy pravartak-15665-credentials.json backend\gcp-credentials.json
```

---

## Troubleshooting

### Error: "Could not automatically determine credentials"
**Cause**: Wrong path to credentials file  
**Fix**: 
```powershell
# Check file exists
Test-Path .\pravartak-15665-credentials.json
# Should return: True
```

### Error: "API not enabled"
**Cause**: Required APIs not enabled in GCP  
**Fix**: Enable all APIs listed in Step 2

### Error: "Permission denied" or "403 Forbidden"
**Cause**: Service account missing required roles  
**Fix**: Re-add roles in IAM & Admin → Service Accounts

### Error: "Invalid API key"
**Cause**: API key is for wrong project  
**Fix**: Generate new key from Google AI Studio for pravartak-15665

### Avatar not speaking / No response
**Possible causes**:
1. Backend not running → Start `python server_ai_interviewer.py`
2. Wrong port → Check backend runs on port 5000
3. CORS issues → Verify backend CORS allows localhost:3000
4. API quota exceeded → Check GCP Console quota page

### SocketIO connection failed
**Cause**: Backend server not reachable  
**Fix**:
```powershell
# Check if backend is running
curl http://127.0.0.1:5000/health

# Should return: {"status": "ok"}
```

---

## Cost Optimization

To minimize GCP costs:

1. **Set Quota Limits**
   - Go to: GCP Console → IAM & Admin → Quotas
   - Set limits on API calls

2. **Use Appropriate Voice**
   - Neural2 voices: ~$16 per million chars
   - Standard voices: ~$4 per million chars

3. **Monitor Usage**
   - Go to: GCP Console → Billing → Reports
   - Set up budget alerts

---

## Security Best Practices

1. **Never commit credentials to Git**
   ```bash
   # Add to .gitignore if not already there
   echo "pravartak-15665-credentials.json" >> .gitignore
   echo "*.json" >> .gitignore
   ```

2. **Rotate API keys regularly**
   - Regenerate keys every 90 days

3. **Use environment variables**
   - Never hardcode credentials in code

4. **Restrict service account permissions**
   - Only grant minimum required roles

---

## Verification Checklist

Before using in production:

- [ ] All credentials are from `pravartak-15665`
- [ ] All APIs are enabled
- [ ] Backend server starts without errors
- [ ] Text-to-Speech works (avatar speaks)
- [ ] Speech-to-Text works (recognizes your voice)
- [ ] Gemini responds to questions
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] Old credentials are backed up
- [ ] New credentials are in `.gitignore`

---

## Rollback Plan

If migration fails:

```powershell
# Restore from backup
$timestamp = "YYYYMMDD_HHMMSS"  # Use your backup folder name
copy backup_$timestamp\.env.backup .\.env
copy backup_$timestamp\backend.env.backup .\backend\.env
copy backup_$timestamp\gcp-credentials.json .\backend\gcp-credentials.json
```

---

## Next Steps

After successful migration:

1. **Test Thoroughly**
   - Test all interview simulator features
   - Test with different positions
   - Test voice recognition accuracy

2. **Clean Up Old Files** (only after confirming everything works)
   ```powershell
   # Remove old credentials
   Remove-Item flash-precept-471409-u3-0a2cc0ca3940.json
   Remove-Item backend\old-credentials.json
   
   # Remove template files
   Remove-Item .env.new
   Remove-Item backend\.env.new
   ```

3. **Update Documentation**
   - Update README with new project info
   - Update setup instructions

4. **Share with Team**
   - Document the new credential location
   - Share updated environment setup

---

## Support Resources

- **GCP Console**: https://console.cloud.google.com
- **Google AI Studio**: https://makersuite.google.com
- **GCP Pricing**: https://cloud.google.com/text-to-speech/pricing
- **Vertex AI Docs**: https://cloud.google.com/vertex-ai/docs

---

## Summary

**What changed:**
- GCP Project: `flash-precept-471409-u3` → `pravartak-15665`
- Credentials file: New service account key required
- API Key: New Gemini API key required
- Configuration: Updated both `.env` files

**Why this fixes the issue:**
- All services now use the same GCP project
- Credentials match the project ID
- API keys are valid for the correct project
- No more authentication conflicts

**Estimated time:** 15-20 minutes (including API enablement)

**Impact:** Zero downtime if done in dev environment

---

Need help? Check the migration guide: `MIGRATION_TO_PRAVARTAK_15665.md`
