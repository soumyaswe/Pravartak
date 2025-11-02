# README: Fixing Interview Simulator GCP Credentials

## 🚨 Quick Start (TL;DR)

Your interview simulator isn't working because it's using credentials from the wrong Google Cloud project. Here's how to fix it:

1. **Get credentials from `pravartak-15665`** (your main project)
2. **Run the migration script**
3. **Test the connection**
4. **Start using your interview simulator** ✅

**Time required:** 15-20 minutes

---

## 📋 What You Have

| Item | Current State | What You Need |
|------|--------------|---------------|
| **Credentials** | `flash-precept-471409-u3` | `pravartak-15665` |
| **API Key** | For wrong project | For `pravartak-15665` |
| **APIs** | Enabled in wrong project | Enable in `pravartak-15665` |
| **Status** | ❌ Not working | ✅ Will work after migration |

---

## 📚 Documentation Files Created

I've created comprehensive documentation to help you:

### 1. **START HERE** 👈
- **`SOLUTION_SUMMARY.md`** - Complete solution overview
- **`VISUAL_GUIDE.md`** - Visual diagrams and explanations

### 2. **Step-by-Step Guides**
- **`MIGRATION_TO_PRAVARTAK_15665.md`** - Detailed migration instructions
- **`MIGRATION_CHECKLIST.md`** - Printable checklist

### 3. **Automation Scripts**
- **`migrate-to-pravartak.ps1`** - Automated migration script
- **`test-gcp-connection.ps1`** - Connection testing script

### 4. **Configuration Templates**
- **`.env.new`** - Root environment template
- **`backend/.env.new`** - Backend environment template

---

## 🎯 The Problem (Simple Explanation)

```
Your App tries to talk to Google Cloud
         ↓
Uses credentials for: flash-precept-471409-u3
         ↓
But you want to use: pravartak-15665
         ↓
MISMATCH = Nothing works ❌
```

**Solution:** Change everything to use `pravartak-15665`

---

## ✅ What You Need to Do

### Step 1: Get Credentials (10 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: **pravartak-15665**
3. Create service account with these roles:
   - Cloud Text-to-Speech Admin
   - Cloud Speech-to-Text Admin
   - Vertex AI User
4. Download JSON key as: `pravartak-15665-credentials.json`
5. Save to: `D:\Pravartak-S\Pravartak\`

**Need help?** See detailed instructions in `MIGRATION_TO_PRAVARTAK_15665.md`

### Step 2: Enable APIs (5 min)

In [GCP Console](https://console.cloud.google.com/apis/library) for `pravartak-15665`:

- ✅ Cloud Text-to-Speech API
- ✅ Cloud Speech-to-Text API
- ✅ Vertex AI API
- ✅ Cloud Speech API

### Step 3: Get API Key (2 min)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Select project: **pravartak-15665**
3. Create API Key
4. Copy it (you'll need it next)

### Step 4: Run Migration (3 min)

Open PowerShell:

```powershell
cd D:\Pravartak-S\Pravartak
.\migrate-to-pravartak.ps1
```

Follow the prompts and enter your API key when asked.

### Step 5: Test Everything (5 min)

```powershell
.\test-gcp-connection.ps1
```

All tests should pass ✅

### Step 6: Start Your App

**Terminal 1 - Backend:**
```powershell
cd backend
python server_ai_interviewer.py
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

**Browser:**
```
http://localhost:3000/interview-simulator
```

---

## 🎉 Success Indicators

You'll know it's working when:

### Backend Terminal Shows:
```
✓ Text-to-Speech client initialized
✓ Speech-to-Text client initialized
✓ Vertex AI initialized for project: pravartak-15665
 * Running on http://127.0.0.1:5000
```

### Interview Simulator:
- ✅ Avatar loads
- ✅ Avatar speaks when you start
- ✅ Microphone captures your voice
- ✅ Avatar responds to your answers

---

## 🔧 Troubleshooting Quick Fixes

### "Could not determine credentials"
**Fix:** Check that `pravartak-15665-credentials.json` exists and path is correct in `.env`

### "API not enabled"
**Fix:** Enable all 4 APIs in GCP Console for `pravartak-15665`

### "Permission denied"
**Fix:** Verify service account has all 3 roles

### Avatar doesn't speak
**Fix:** 
1. Check backend is running
2. Check browser console for errors
3. Verify Text-to-Speech API is enabled

### Microphone doesn't work
**Fix:**
1. Grant browser microphone permission
2. Verify Speech-to-Text API is enabled
3. Check backend logs

---

## 📞 Need More Help?

### Read These (In Order):

1. **Understanding the problem:**
   - Read: `VISUAL_GUIDE.md`
   
2. **Complete solution:**
   - Read: `SOLUTION_SUMMARY.md`
   
3. **Step-by-step migration:**
   - Read: `MIGRATION_TO_PRAVARTAK_15665.md`
   
4. **Checklist while migrating:**
   - Use: `MIGRATION_CHECKLIST.md`

### Use These Scripts:

1. **Automate migration:**
   ```powershell
   .\migrate-to-pravartak.ps1
   ```

2. **Test connection:**
   ```powershell
   .\test-gcp-connection.ps1
   ```

---

## 📦 File Structure After Migration

```
D:\Pravartak-S\Pravartak\
│
├── .env                                    ← UPDATED
│   └── GCP_PROJECT_ID: pravartak-15665
│
├── pravartak-15665-credentials.json        ← NEW FILE (you create)
│
├── backend/
│   ├── .env                                ← UPDATED
│   │   └── GCP_PROJECT_ID: pravartak-15665
│   │
│   ├── gcp-credentials.json                ← UPDATED
│   │   └── Copy of pravartak-15665-credentials.json
│   │
│   └── server_ai_interviewer.py
│
├── Documentation (CREATED FOR YOU):
│   ├── SOLUTION_SUMMARY.md
│   ├── VISUAL_GUIDE.md
│   ├── MIGRATION_TO_PRAVARTAK_15665.md
│   └── MIGRATION_CHECKLIST.md
│
└── Scripts (CREATED FOR YOU):
    ├── migrate-to-pravartak.ps1
    └── test-gcp-connection.ps1
```

---

## ⚡ Quick Command Reference

### Check if backend is running:
```powershell
curl http://127.0.0.1:5000/health
```

### Check current configuration:
```powershell
Get-Content backend\.env | Select-String "GCP_PROJECT_ID"
```

### Verify credentials:
```powershell
$creds = Get-Content backend\gcp-credentials.json | ConvertFrom-Json
$creds.project_id
# Should show: pravartak-15665
```

### Start backend:
```powershell
cd backend
python server_ai_interviewer.py
```

### Start frontend:
```powershell
npm run dev
```

---

## 🎯 Migration Checklist (Quick Version)

- [ ] Create service account in `pravartak-15665`
- [ ] Download credentials JSON file
- [ ] Enable 4 APIs in GCP Console
- [ ] Get Gemini API key
- [ ] Run `migrate-to-pravartak.ps1`
- [ ] Run `test-gcp-connection.ps1`
- [ ] Start backend server
- [ ] Start frontend
- [ ] Test interview simulator
- [ ] Verify avatar speaks
- [ ] Verify microphone works
- [ ] ✅ Done!

---

## 🔄 Rollback (If Needed)

If something goes wrong, backups are in: `backup_YYYYMMDD_HHMMSS/`

To restore:
```powershell
$backup = "backup_20250102_143022"  # Use your folder name
copy $backup\.env.backup .\.env
copy $backup\backend.env.backup .\backend\.env
copy $backup\gcp-credentials.json .\backend\gcp-credentials.json
```

---

## 💰 Cost Estimates

Using `pravartak-15665`:

- **Text-to-Speech:** ~$16 per million characters
- **Speech-to-Text:** ~$0.024 per minute
- **Vertex AI (Gemini):** Pay per use

**Typical interview session (15 min):**
- TTS: ~500 chars = $0.008
- STT: ~7 min = $0.17
- Gemini: ~10 requests = $0.01
- **Total: ~$0.19 per interview**

---

## 🎓 Key Concepts

### Service Account
- Like a robot user for your app
- Has its own credentials (JSON file)
- Needs permission to use APIs

### API Key
- Simple string for authentication
- Used specifically for Gemini
- Must be from same project

### Project ID
- Unique identifier for GCP project
- Must match everywhere
- Currently: `flash-precept-471409-u3` (wrong)
- Target: `pravartak-15665` (correct)

---

## ✨ After Migration

Once everything works:

1. **Test thoroughly** for 1-2 days
2. **Monitor costs** in GCP Console
3. **Document for team**
4. **Clean up** old credentials (after 1 week)
5. **Update** any deployment scripts

---

## 🚀 Next Steps

**Right now:**
1. Create service account → 10 min
2. Enable APIs → 5 min
3. Get API key → 2 min
4. Run migration script → 3 min
5. Test → 5 min

**Total time:** ~25 minutes

**Then:**
- ✅ Interview simulator will work
- ✅ Avatar will speak
- ✅ Microphone will capture input
- ✅ Conversations will flow naturally

---

## 📱 Support

**Created documentation:**
- ✅ 5 comprehensive guides
- ✅ 2 automated scripts
- ✅ 2 configuration templates
- ✅ Visual diagrams
- ✅ Step-by-step checklist

**Everything you need is here!** 🎉

---

**Last Updated:** November 2, 2025  
**Project:** Pravartak AI Interview Simulator  
**Migration:** flash-precept-471409-u3 → pravartak-15665

---

## 🎬 Let's Get Started!

**Start with:** `SOLUTION_SUMMARY.md` or run `.\migrate-to-pravartak.ps1`

Good luck! 🚀
