# 🔧 FIX: "Connecting to Server" Issue

## Problem
The frontend shows "Connecting to server..." because the **backend server is not running**.

## Root Cause
Python packages are not installed in the virtual environment.

## ✅ SOLUTION - Follow These Steps EXACTLY:

### Step 1: Open PowerShell in Backend Folder

```powershell
cd "c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak\backend"
```

### Step 2: Activate Virtual Environment

```powershell
.\venv\Scripts\Activate.ps1
```

You should see `(venv)` at the start of your terminal prompt.

### Step 3: Install Packages (THIS IS THE KEY STEP)

**Option A - Install All at Once (Fastest):**
```powershell
pip install Flask==3.0.0 flask-cors==4.0.0 Flask-SocketIO==5.3.5 eventlet==0.33.3 google-cloud-texttospeech==2.16.3 google-cloud-speech==2.21.0 google-cloud-aiplatform==1.38.1 google-generativeai python-dotenv==1.0.0
```

**Option B - Use Requirements File:**
```powershell
pip install -r requirements.txt
```

**This will take 2-5 minutes.** Let it complete fully!

### Step 4: Test Installation

```powershell
python test_dependencies.py
```

You should see all ✅ checkmarks.

### Step 5: Start the Backend Server

```powershell
python server_ai_interviewer.py
```

You should see:
```
🚀 AI Interviewer Avatar Server Starting...
📍 Host: 127.0.0.1
🔌 Port: 5000
🤖 AI Model: Gemini 1.5 Flash
🎤 Speech-to-Text: Enabled
🔊 Text-to-Speech: Enabled
```

**KEEP THIS TERMINAL OPEN!** The server must stay running.

### Step 6: Start Frontend (New Terminal)

Open a **NEW PowerShell window**:

```powershell
cd "c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak"
npm run dev
```

### Step 7: Open Browser

Go to: `http://localhost:3000/interview-simulator`

The "Connecting to server..." should change to "Connected - Ready to start" ✅

---

## 🐛 If It Still Doesn't Work:

### Check 1: Is Backend Actually Running?

In the backend terminal, you should see:
```
* Running on http://127.0.0.1:5000
```

### Check 2: Can You Access Backend Directly?

Open browser and go to: `http://127.0.0.1:5000/health`

You should see:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "active_sessions": 0
}
```

### Check 3: Port 5000 Available?

Run in PowerShell:
```powershell
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
```

If you see output, port 5000 is in use. Kill it:
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
```

### Check 4: Virtual Environment Active?

Your prompt should show `(venv)` like this:
```
(venv) PS C:\Users\bsubh\...\backend>
```

If not, run:
```powershell
.\venv\Scripts\Activate.ps1
```

---

## 📋 Quick Checklist

Before you start:

- [ ] PowerShell opened in `backend` folder
- [ ] Virtual environment activated `(venv)` showing
- [ ] All packages installed (Step 3)
- [ ] test_dependencies.py shows all ✅
- [ ] Backend server running (Step 5)
- [ ] Frontend running in separate terminal (Step 6)
- [ ] Both servers running simultaneously

---

## ⚡ Ultra-Quick Commands (Copy-Paste All at Once)

```powershell
# In Terminal 1:
cd "c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak\backend"
.\venv\Scripts\Activate.ps1
pip install Flask flask-cors Flask-SocketIO eventlet google-cloud-texttospeech google-cloud-speech google-cloud-aiplatform google-generativeai python-dotenv
python server_ai_interviewer.py
```

Then in **NEW Terminal 2**:
```powershell
cd "c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak"
npm run dev
```

---

## 🎯 Expected Result

When everything is working:

1. **Backend Terminal:** Shows server running on port 5000
2. **Frontend Terminal:** Shows Next.js running on port 3000
3. **Browser:** Interview Simulator loads with "Connected - Ready to start"
4. **Console (F12):** Shows "✅ Connected to server"

The connection issue will be FIXED! ✅
