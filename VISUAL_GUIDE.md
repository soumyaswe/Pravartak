# Visual Guide: GCP Project Conflict

## Current Problem (Why It's Not Working)

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR APPLICATION                         │
│                                                              │
│  ┌──────────────────┐              ┌───────────────────┐   │
│  │  Frontend        │              │  Backend          │   │
│  │  (Next.js)       │─────────────▶│  (Flask)          │   │
│  │                  │  Socket.IO   │                   │   │
│  │  Port: 3000      │              │  Port: 5000       │   │
│  └──────────────────┘              └─────────┬─────────┘   │
│                                               │             │
└───────────────────────────────────────────────┼─────────────┘
                                                │
                                                │ Uses credentials
                                                ▼
                            ┌───────────────────────────────────┐
                            │  flash-precept-471409-u3         │
                            │  (Wrong GCP Project!)            │
                            │                                  │
                            │  ❌ Service Account              │
                            │  ❌ Gemini API                   │
                            │  ❌ Text-to-Speech API           │
                            │  ❌ Speech-to-Text API           │
                            └───────────────────────────────────┘
                                                │
                                                ▼
                                    ⚠️ AUTHENTICATION FAILS ⚠️
                                    Avatar doesn't speak
                                    Can't process voice input
```

---

## What You Want (Target State)

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR APPLICATION                         │
│                                                              │
│  ┌──────────────────┐              ┌───────────────────┐   │
│  │  Frontend        │              │  Backend          │   │
│  │  (Next.js)       │─────────────▶│  (Flask)          │   │
│  │                  │  Socket.IO   │                   │   │
│  │  Port: 3000      │              │  Port: 5000       │   │
│  └──────────────────┘              └─────────┬─────────┘   │
│                                               │             │
└───────────────────────────────────────────────┼─────────────┘
                                                │
                                                │ Uses credentials
                                                ▼
                            ┌───────────────────────────────────┐
                            │  pravartak-15665                 │
                            │  (Your Main GCP Project!)        │
                            │                                  │
                            │  ✅ Service Account              │
                            │  ✅ Gemini API                   │
                            │  ✅ Text-to-Speech API           │
                            │  ✅ Speech-to-Text API           │
                            └───────────────────────────────────┘
                                                │
                                                ▼
                                    ✓ AUTHENTICATION SUCCESS ✓
                                    Avatar speaks!
                                    Processes voice input!
```

---

## File Structure: Before vs After

### BEFORE (Current - Not Working)
```
D:\Pravartak-S\Pravartak\
│
├── .env
│   ├── GOOGLE_CLOUD_PROJECT_ID="flash-precept-471409-u3"  ❌
│   ├── GOOGLE_APPLICATION_CREDENTIALS="./flash-precept-471409-u3-0a2cc0ca3940.json"  ❌
│   └── GEMINI_API_KEY="AIzaSyCwm_xsG1fXJtR-hWm5DtGGJDieey_fpBY"  ❌
│
├── flash-precept-471409-u3-0a2cc0ca3940.json  ❌ (Wrong project)
│
└── backend/
    ├── .env
    │   ├── GCP_PROJECT_ID=flash-precept-471409-u3  ❌
    │   ├── GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
    │   └── GEMINI_API_KEY=AIzaSyCwm_xsG1fXJtR-hWm5DtGGJDieey_fpBY  ❌
    │
    ├── gcp-credentials.json  ❌ (Points to wrong project)
    └── server_ai_interviewer.py
```

### AFTER (Target - Will Work)
```
D:\Pravartak-S\Pravartak\
│
├── .env
│   ├── GOOGLE_CLOUD_PROJECT_ID="pravartak-15665"  ✅
│   ├── GOOGLE_APPLICATION_CREDENTIALS="./pravartak-15665-credentials.json"  ✅
│   └── GEMINI_API_KEY="YOUR_NEW_API_KEY"  ✅
│
├── pravartak-15665-credentials.json  ✅ (Correct project)
│
└── backend/
    ├── .env
    │   ├── GCP_PROJECT_ID=pravartak-15665  ✅
    │   ├── GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
    │   └── GEMINI_API_KEY=YOUR_NEW_API_KEY  ✅
    │
    ├── gcp-credentials.json  ✅ (Copy of pravartak-15665-credentials.json)
    └── server_ai_interviewer.py
```

---

## Data Flow: How Interview Simulator Works

```
User Opens Interview Simulator Page
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. USER INTERFACE (Frontend)                                │
│    - User selects position                                  │
│    - Clicks "Start Interview"                               │
│    - 3D Avatar rendered with Three.js                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼ Socket.IO connection
┌─────────────────────────────────────────────────────────────┐
│ 2. FLASK BACKEND (server_ai_interviewer.py)                 │
│    - Receives start_interview event                         │
│    - Needs to call GCP APIs                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼ Uses GOOGLE_APPLICATION_CREDENTIALS
┌─────────────────────────────────────────────────────────────┐
│ 3. GOOGLE CLOUD AUTHENTICATION                              │
│    - Reads credentials JSON file                            │
│    - Verifies project_id matches GCP_PROJECT_ID             │
│    - Authenticates service account                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼ If authentication succeeds
┌─────────────────────────────────────────────────────────────┐
│ 4. GEMINI AI (Vertex AI)                                    │
│    - Generates interview questions                          │
│    - Creates conversational responses                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼ Text response
┌─────────────────────────────────────────────────────────────┐
│ 5. TEXT-TO-SPEECH API                                       │
│    - Converts text to audio                                 │
│    - Generates phoneme timings for lip-sync                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼ Audio data + viseme data
┌─────────────────────────────────────────────────────────────┐
│ 6. FRONTEND RECEIVES DATA                                   │
│    - Plays audio through ReactAudioPlayer                   │
│    - Animates avatar mouth with viseme data                 │
│    - Avatar appears to speak!                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼ User speaks
┌─────────────────────────────────────────────────────────────┐
│ 7. SPEECH-TO-TEXT API                                       │
│    - Captures user's voice                                  │
│    - Converts to text                                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼ Back to step 4 (Gemini processes response)


❌ BREAKS AT STEP 3 IF CREDENTIALS ARE WRONG!
✅ WORKS IF CREDENTIALS MATCH YOUR MAIN PROJECT!
```

---

## The Three Projects Involved

### 1. pravartak-15665 (YOUR MAIN PROJECT) ⭐
```
Purpose: Your main application project
Status: ✅ This is where you want everything
Action: Create service account here
Result: Everything runs from one project (clean!)
```

### 2. flash-precept-471409-u3 (CURRENTLY CONFIGURED)
```
Purpose: Was used for interview simulator POC
Status: ❌ Currently configured but you want to switch away
Action: Keep as backup, but don't use
Result: Causing the conflict
```

### 3. experiments-476911 (MENTIONED BUT NOT USED)
```
Purpose: Created for that feature initially
Status: ⚠️ Not actually configured anywhere
Action: Can ignore for now
Result: Not causing issues
```

---

## API Keys Explained

### What's the difference?

```
┌──────────────────────────────────────────────────────────────┐
│ SERVICE ACCOUNT (credentials JSON file)                      │
│                                                               │
│ Used for: Server-side authentication                         │
│ Contains: Private key, client email, project ID              │
│ Used by: Flask backend                                       │
│ APIs: Text-to-Speech, Speech-to-Text, Vertex AI             │
│                                                               │
│ Location: gcp-credentials.json                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ GEMINI API KEY                                                │
│                                                               │
│ Used for: Direct Gemini API access (alternative method)      │
│ Contains: Simple API key string                              │
│ Used by: Can be used by frontend or backend                  │
│ APIs: Only Gemini (Google AI)                                │
│                                                               │
│ Location: GEMINI_API_KEY in .env                             │
└──────────────────────────────────────────────────────────────┘
```

**Both need to be from the same project: pravartak-15665**

---

## Step-by-Step Visual Migration

```
STEP 1: Get New Credentials
┌─────────────────────────────────────────────┐
│  Google Cloud Console                       │
│  ├─ Select: pravartak-15665                 │
│  ├─ IAM & Admin → Service Accounts          │
│  ├─ Create Service Account                  │
│  ├─ Add Roles (TTS, STT, Vertex AI)         │
│  └─ Download JSON key                       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
         Save as: pravartak-15665-credentials.json


STEP 2: Enable APIs
┌─────────────────────────────────────────────┐
│  Google Cloud Console                       │
│  ├─ Select: pravartak-15665                 │
│  ├─ APIs & Services → Library               │
│  ├─ Enable: Text-to-Speech API             │
│  ├─ Enable: Speech-to-Text API             │
│  └─ Enable: Vertex AI API                  │
└─────────────────────────────────────────────┘


STEP 3: Get Gemini API Key
┌─────────────────────────────────────────────┐
│  Google AI Studio                           │
│  ├─ makersuite.google.com                   │
│  ├─ Select: pravartak-15665                 │
│  ├─ Create API Key                          │
│  └─ Copy key                                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
              Save for Step 4


STEP 4: Run Migration Script
┌─────────────────────────────────────────────┐
│  PowerShell                                 │
│  > cd D:\Pravartak-S\Pravartak              │
│  > .\migrate-to-pravartak.ps1               │
│                                             │
│  Script will:                               │
│  ├─ Backup current config                   │
│  ├─ Ask for Gemini API key                  │
│  ├─ Update .env files                       │
│  └─ Copy credentials                        │
└─────────────────────────────────────────────┘


STEP 5: Test Connection
┌─────────────────────────────────────────────┐
│  PowerShell                                 │
│  > .\test-gcp-connection.ps1                │
│                                             │
│  Tests:                                     │
│  ├─ ✅ Environment variables                │
│  ├─ ✅ Credentials file                     │
│  ├─ ✅ Text-to-Speech API                   │
│  ├─ ✅ Speech-to-Text API                   │
│  └─ ✅ Vertex AI                            │
└─────────────────────────────────────────────┘


STEP 6: Start Application
┌─────────────────────────────────────────────┐
│  Terminal 1: Backend                        │
│  > cd backend                               │
│  > python server_ai_interviewer.py          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Terminal 2: Frontend                       │
│  > npm run dev                              │
└─────────────────────────────────────────────┘


STEP 7: Test Interview Simulator
┌─────────────────────────────────────────────┐
│  Browser                                    │
│  > http://localhost:3000/interview-simulator│
│                                             │
│  Actions:                                   │
│  ├─ Select position                         │
│  ├─ Click "Start Interview"                 │
│  ├─ Avatar should speak ✅                  │
│  └─ Mic should work ✅                      │
└─────────────────────────────────────────────┘
```

---

## Quick Reference Commands

### Check Current Configuration
```powershell
# Check backend .env
Get-Content backend\.env | Select-String "GCP_PROJECT_ID|GEMINI_API_KEY"

# Check credentials file project
$creds = Get-Content backend\gcp-credentials.json | ConvertFrom-Json
$creds.project_id
```

### Run Migration (Automated)
```powershell
cd D:\Pravartak-S\Pravartak
.\migrate-to-pravartak.ps1
```

### Test Everything
```powershell
.\test-gcp-connection.ps1
```

### Start Backend
```powershell
cd backend
python server_ai_interviewer.py
```

### Check Backend is Running
```powershell
curl http://127.0.0.1:5000/health
```

---

## Common Errors Visualization

### Error 1: Wrong Project ID
```
Backend .env:
GCP_PROJECT_ID=flash-precept-471409-u3  ❌

Credentials file:
{
  "project_id": "pravartak-15665"        ✅
}

Result: MISMATCH! → Auth fails
```

### Error 2: Wrong Credentials File
```
Backend .env:
GCP_PROJECT_ID=pravartak-15665           ✅

Credentials file:
{
  "project_id": "flash-precept-471409-u3"  ❌
}

Result: MISMATCH! → Auth fails
```

### Error 3: APIs Not Enabled
```
Credentials: ✅ Correct
Project ID: ✅ Correct
APIs Enabled: ❌ No

Result: "API not enabled" error
```

### Correct Configuration
```
Backend .env:
GCP_PROJECT_ID=pravartak-15665           ✅

Credentials file:
{
  "project_id": "pravartak-15665"        ✅
}

APIs: ✅ All enabled

Result: WORKS! 🎉
```

---

## Success Indicators

You know it's working when you see:

### In Backend Terminal
```
✓ Text-to-Speech client initialized
✓ Speech-to-Text client initialized  
✓ Vertex AI initialized for project: pravartak-15665
 * Running on http://127.0.0.1:5000
```

### In Browser
```
- Avatar loads and renders
- When you click "Start Interview":
  → Avatar mouth moves
  → You hear voice
  → Microphone captures your voice
  → Avatar responds to your answers
```

### In Browser Console (No Errors)
```
✓ Socket connected
✓ Interview started
✓ Received audio data
✓ Received blend shapes
```

---

## Need Help?

1. **Read detailed guide**: `MIGRATION_TO_PRAVARTAK_15665.md`
2. **Run automated script**: `migrate-to-pravartak.ps1`
3. **Test connection**: `test-gcp-connection.ps1`
4. **Check this summary**: `SOLUTION_SUMMARY.md`

---

**Remember**: All three components (credentials, project ID, API key) must be from `pravartak-15665` for everything to work!
