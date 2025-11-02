# Migration Checklist - pravartak-15665

**Date:** _______________  
**Completed by:** _______________

---

## Pre-Migration Checklist

### ☐ 1. Understand the Problem
- [ ] Read `VISUAL_GUIDE.md` to understand the issue
- [ ] Read `SOLUTION_SUMMARY.md` for overview
- [ ] Confirm you want to migrate to `pravartak-15665`

### ☐ 2. Access Requirements
- [ ] Access to Google Cloud Console
- [ ] Owner/Editor role in `pravartak-15665` project
- [ ] Access to Google AI Studio

---

## GCP Setup Checklist

### ☐ 3. Create Service Account (10 minutes)

Go to: https://console.cloud.google.com

- [ ] Select project: `pravartak-15665`
- [ ] Navigate to: **IAM & Admin** → **Service Accounts**
- [ ] Click: **CREATE SERVICE ACCOUNT**
- [ ] Enter name: `pravartak-ai-services` (or your choice)
- [ ] Enter description: `Service account for AI interview simulator`
- [ ] Click: **CREATE AND CONTINUE**

**Grant Roles:**
- [ ] Add role: **Cloud Text-to-Speech Admin**
- [ ] Add role: **Cloud Speech-to-Text Admin**
- [ ] Add role: **Vertex AI User**
- [ ] Click: **CONTINUE** → **DONE**

**Create Key:**
- [ ] Click on the service account name
- [ ] Go to **KEYS** tab
- [ ] Click: **ADD KEY** → **Create new key**
- [ ] Select: **JSON**
- [ ] Click: **CREATE**
- [ ] Save as: `pravartak-15665-credentials.json`
- [ ] Move to: `D:\Pravartak-S\Pravartak\`

### ☐ 4. Enable APIs (5 minutes)

Go to: https://console.cloud.google.com/apis/library

- [ ] Select project: `pravartak-15665`
- [ ] Search and enable: **Cloud Text-to-Speech API**
- [ ] Search and enable: **Cloud Speech-to-Text API**
- [ ] Search and enable: **Vertex AI API**
- [ ] Search and enable: **Cloud Speech API**

**Verify APIs are enabled:**
- [ ] Go to: APIs & Services → Enabled APIs
- [ ] Confirm all 4 APIs are listed

### ☐ 5. Get Gemini API Key (2 minutes)

Go to: https://makersuite.google.com/app/apikey

- [ ] Click on project dropdown (top of page)
- [ ] Select or create in: `pravartak-15665`
- [ ] Click: **Create API Key**
- [ ] Copy the key (starts with `AIza...`)
- [ ] Save key securely (you'll need it soon)

**Your Gemini API Key:**
```
___________________________________________
```

---

## Migration Execution Checklist

### ☐ 6. Backup Current Configuration (1 minute)

```powershell
cd D:\Pravartak-S\Pravartak
```

- [ ] Create backup folder manually (if script fails)
- [ ] Copy `.env` to backup
- [ ] Copy `backend\.env` to backup
- [ ] Copy credential files to backup

### ☐ 7. Run Migration Script (3 minutes)

```powershell
.\migrate-to-pravartak.ps1
```

**During script execution:**
- [ ] Script detects `pravartak-15665-credentials.json`
- [ ] Script validates credentials file
- [ ] Script backs up existing configuration
- [ ] Enter your Gemini API key when prompted
- [ ] Script updates `.env` files
- [ ] Script copies credentials to backend
- [ ] Script completes successfully

**Backup location:** _______________________

### ☐ 8. Verify File Updates (2 minutes)

**Check Root `.env`:**
```powershell
Get-Content .env | Select-String "pravartak-15665"
```
- [ ] `GOOGLE_CLOUD_PROJECT_ID="pravartak-15665"` ✅
- [ ] `GOOGLE_APPLICATION_CREDENTIALS` points to new file ✅
- [ ] `GEMINI_API_KEY` is updated ✅

**Check Backend `.env`:**
```powershell
Get-Content backend\.env | Select-String "pravartak-15665"
```
- [ ] `GCP_PROJECT_ID=pravartak-15665` ✅
- [ ] `GEMINI_API_KEY` is updated ✅

**Check Credentials Files:**
- [ ] `pravartak-15665-credentials.json` exists in root
- [ ] `backend\gcp-credentials.json` exists
- [ ] Both files have same content
- [ ] `project_id` in JSON is `pravartak-15665`

---

## Testing Checklist

### ☐ 9. Test GCP Connection (5 minutes)

```powershell
.\test-gcp-connection.ps1
```

**Expected results:**
- [ ] ✅ Environment variables check passes
- [ ] ✅ Credentials file check passes
- [ ] ✅ Text-to-Speech API connection successful
- [ ] ✅ Speech-to-Text API connection successful
- [ ] ✅ Vertex AI connection successful

**If any test fails:**
- [ ] Check which API failed
- [ ] Verify that API is enabled in GCP Console
- [ ] Verify credentials file is correct
- [ ] Re-run test after fixing

### ☐ 10. Test Backend Server (3 minutes)

**Start backend:**
```powershell
cd backend
python server_ai_interviewer.py
```

**Expected output:**
- [ ] See: `✓ Text-to-Speech client initialized`
- [ ] See: `✓ Speech-to-Text client initialized`
- [ ] See: `✓ Vertex AI initialized for project: pravartak-15665`
- [ ] See: `Running on http://127.0.0.1:5000`
- [ ] No error messages

**If errors occur:**
- [ ] Note the error message: _______________________
- [ ] Check `GOOGLE_APPLICATION_CREDENTIALS` path
- [ ] Verify credentials file exists
- [ ] Check API enablement

### ☐ 11. Test Health Endpoint (1 minute)

**In new PowerShell window:**
```powershell
curl http://127.0.0.1:5000/health
```

- [ ] Response: `{"status": "ok"}` or similar
- [ ] No connection errors

### ☐ 12. Test Frontend (2 minutes)

**In new PowerShell window:**
```powershell
cd D:\Pravartak-S\Pravartak
npm run dev
```

- [ ] Next.js starts successfully
- [ ] No environment variable errors
- [ ] Opens on `http://localhost:3000`

### ☐ 13. Test Interview Simulator (5 minutes)

**Open browser:** http://localhost:3000/interview-simulator

**Basic functionality:**
- [ ] Page loads without errors
- [ ] 3D Avatar renders
- [ ] Can select interview position
- [ ] "Start Interview" button is visible

**Start interview:**
- [ ] Click "Start Interview"
- [ ] Avatar starts speaking (audio plays)
- [ ] Avatar mouth moves (lip-sync works)
- [ ] Can hear clear audio

**Test microphone:**
- [ ] Click microphone button
- [ ] Speak clearly
- [ ] Microphone captures voice
- [ ] Avatar responds to your answer

**Check browser console (F12):**
- [ ] No red errors related to authentication
- [ ] No CORS errors
- [ ] Socket.IO connected successfully

---

## Verification Checklist

### ☐ 14. Complete Feature Test (10 minutes)

**Test full interview flow:**
- [ ] Select position: "Software Engineer"
- [ ] Start interview
- [ ] Answer first question (speak clearly)
- [ ] Avatar responds appropriately
- [ ] Answer second question
- [ ] Complete at least 3 Q&A exchanges
- [ ] No audio dropouts
- [ ] No connection losses

**Test different positions:**
- [ ] Test with: "Product Manager"
- [ ] Test with: "Data Scientist"
- [ ] All positions work correctly

**Test edge cases:**
- [ ] Interrupt avatar while speaking
- [ ] Speak when not your turn
- [ ] Long answers (>30 seconds)
- [ ] Background noise handling
- [ ] End interview prematurely

### ☐ 15. Performance Check

- [ ] Avatar response time < 3 seconds
- [ ] Lip-sync is smooth
- [ ] Audio quality is good
- [ ] No lag in UI
- [ ] Memory usage is stable

---

## Post-Migration Checklist

### ☐ 16. Documentation

- [ ] Document backup location: _______________________
- [ ] Document new Gemini API key location: _______________________
- [ ] Update team wiki/docs with new setup
- [ ] Share migration guide with team

### ☐ 17. Security

- [ ] Verify `.gitignore` includes `pravartak-15665-credentials.json`
- [ ] Verify `.gitignore` includes `backend/gcp-credentials.json`
- [ ] Remove API keys from any public repos
- [ ] Store credentials securely

**Check .gitignore:**
```powershell
Get-Content .gitignore | Select-String "credentials"
```
- [ ] Credentials files are ignored

### ☐ 18. Cleanup (After 1 week of stable operation)

**Only if everything works perfectly:**
- [ ] Remove old credentials file: `flash-precept-471409-u3-0a2cc0ca3940.json`
- [ ] Remove template files: `.env.new`, `backend\.env.new`
- [ ] Archive backup folder
- [ ] Document in changelog

### ☐ 19. Monitoring Setup

- [ ] Set up GCP quota alerts
- [ ] Monitor API usage in GCP Console
- [ ] Set up billing alerts
- [ ] Document expected costs

**Expected monthly costs:**
- Text-to-Speech: ~$_____ (based on usage)
- Speech-to-Text: ~$_____ (based on usage)
- Vertex AI: ~$_____ (based on usage)
- Total: ~$_____

---

## Troubleshooting Checklist

### If Avatar Doesn't Speak:

- [ ] Check backend logs for errors
- [ ] Verify Text-to-Speech API is enabled
- [ ] Check credentials file path
- [ ] Test with `test-gcp-connection.ps1`
- [ ] Check browser console for errors
- [ ] Verify audio output is not muted

### If Microphone Doesn't Work:

- [ ] Check browser microphone permissions
- [ ] Verify Speech-to-Text API is enabled
- [ ] Check backend logs for STT errors
- [ ] Test microphone in other apps
- [ ] Check Socket.IO connection

### If Authentication Fails:

- [ ] Verify `project_id` in credentials matches `.env`
- [ ] Check service account has correct roles
- [ ] Verify APIs are enabled
- [ ] Check credentials file is valid JSON
- [ ] Try creating new service account

### If Socket.IO Fails:

- [ ] Verify backend is running on port 5000
- [ ] Check CORS configuration
- [ ] Verify frontend connects to correct URL
- [ ] Check firewall settings
- [ ] Test with `curl http://127.0.0.1:5000/health`

---

## Rollback Checklist (If Migration Fails)

### ☐ Emergency Rollback

**If critical issues occur:**

```powershell
# Restore from backup
cd D:\Pravartak-S\Pravartak
$backup = "backup_YYYYMMDD_HHMMSS"  # Use your backup folder
```

- [ ] Stop all servers (Ctrl+C in terminals)
- [ ] Restore root `.env`: `copy $backup\.env.backup .\.env`
- [ ] Restore backend `.env`: `copy $backup\backend.env.backup .\backend\.env`
- [ ] Restore credentials: `copy $backup\gcp-credentials.json .\backend\`
- [ ] Restart backend: `cd backend; python server_ai_interviewer.py`
- [ ] Restart frontend: `npm run dev`
- [ ] Verify old system works
- [ ] Document what went wrong
- [ ] Wait before retrying migration

---

## Sign-off

### Migration Completed Successfully

**Completed by:** _______________  
**Date:** _______________  
**Time:** _______________

**All tests passed:**
- [ ] Yes, all green ✅
- [ ] No, see issues below ⚠️

**Issues encountered:**
```
_____________________________________________
_____________________________________________
_____________________________________________
```

**Resolution:**
```
_____________________________________________
_____________________________________________
_____________________________________________
```

**Production ready:**
- [ ] Yes, ready for production
- [ ] No, needs more testing

**Next steps:**
```
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## Additional Notes

```
_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________
```

---

**References:**
- Migration Guide: `MIGRATION_TO_PRAVARTAK_15665.md`
- Solution Summary: `SOLUTION_SUMMARY.md`
- Visual Guide: `VISUAL_GUIDE.md`
- Migration Script: `migrate-to-pravartak.ps1`
- Test Script: `test-gcp-connection.ps1`
