# ✅ Talking Avatar Integration - Quick Start

## 🎉 Good News!

The talking avatar is **fully integrated** and ready to use! All necessary files are in place.

## 📋 Final Setup Steps

### 1. Install Backend Dependencies

Open PowerShell and run:

```powershell
cd "c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak\backend"

# Create virtual environment (if needed)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

**Note:** This may take 2-3 minutes to download and install all packages.

### 2. Start the System

You have two options:

#### Option A: Use the Start Script (Recommended)
```powershell
cd "c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak"
.\start-interview-simulator.ps1
```

This will automatically start both backend and frontend.

#### Option B: Manual Start

**Terminal 1 - Backend:**
```powershell
cd "c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak\backend"
.\venv\Scripts\Activate.ps1
python server_ai_interviewer.py
```

**Terminal 2 - Frontend:**
```powershell
cd "c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak"
npm run dev
```

### 3. Open the Interview Simulator

Once both servers are running, open your browser and go to:

```
http://localhost:3000/interview-simulator
```

## 🎯 How It Works

1. **Lobby Screen:**
   - Select an interview position from the dropdown
   - Make sure your camera/microphone permissions are granted
   - Click "Start Interview"

2. **Interview Room:**
   - The AI avatar will greet you with voice and lip-sync animation
   - Click the green "Respond" button to answer
   - Speak your answer clearly
   - Click "Stop" when done
   - The AI will process your answer and ask a follow-up question

3. **Controls:**
   - 🎤 Mic: Toggle microphone
   - 💬 Respond: Record your answer
   - 📹 Camera: Toggle video
   - 📄 Transcript: View conversation history
   - ☎️ End: Exit interview

## 🔧 Troubleshooting

### Backend Issues

**"Module not found" error:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Port 5000 already in use:**
```powershell
# Find and kill the process using port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

### Frontend Issues

**"Socket connection failed":**
- Make sure backend is running on port 5000
- Check backend console for errors
- Verify `.env` file exists in `backend/` folder

**Avatar not visible:**
- Check browser console (F12) for errors
- Verify `/public/model.glb` and `/public/idle.fbx` exist
- Clear browser cache and reload

**No audio from avatar:**
- Check system volume
- Verify microphone/speaker permissions in browser
- Look for audio files in `backend/audio_files/`

### Camera/Microphone

**Permissions denied:**
1. Click the camera icon in browser address bar
2. Allow camera and microphone access
3. Refresh the page

**Video not showing:**
- Try a different browser (Chrome/Edge recommended)
- Check Windows privacy settings
- Restart browser

## 📂 Project Structure

```
Pravartak/
├── app/(main)/interview-simulator/
│   ├── page.jsx                      # Main page
│   └── _components/
│       ├── InterviewSimulator.jsx    # Avatar + UI
│       ├── converter.js               # Animation engine
│       └── blendDataBlink.json        # Blink animation
│
├── backend/
│   ├── server_ai_interviewer.py      # Flask server ✅
│   ├── requirements.txt               # Dependencies ✅
│   ├── .env                           # Config ✅
│   ├── gcp-credentials.json           # GCP keys ✅
│   └── audio_files/                   # Generated audio
│
└── public/
    ├── model.glb                      # 3D model ✅
    ├── idle.fbx                       # Idle animation ✅
    └── images/                        # Textures ✅
```

## 🎨 Customization

### Change Avatar Voice

Edit `backend/.env`:
```env
VOICE_NAME=en-US-Neural2-F  # Female voice
# Other options:
# en-US-Neural2-A (Male)
# en-US-Neural2-C (Female)
# en-US-Neural2-D (Male)
# en-US-Neural2-E (Female)
```

### Add Interview Positions

Edit `app/(main)/interview-simulator/_components/InterviewSimulator.jsx`:
```javascript
const INTERVIEW_POSITIONS = [
  'Software Engineer',
  'Product Manager',
  // Add your own:
  'DevOps Engineer',
  'Data Scientist',
];
```

### Modify AI Behavior

Edit the system prompt in `backend/server_ai_interviewer.py` (line ~143):
```python
system_instruction = """You are Alex, a professional AI interviewer...

# Customize the instructions here
```

## 📊 System Requirements

- **Python:** 3.8+ (for backend)
- **Node.js:** 18+ (for frontend)
- **Browser:** Chrome/Edge (best performance)
- **RAM:** 4GB+ recommended
- **Internet:** Required for GCP API calls

## 🔐 Environment Variables

Ensure `backend/.env` has:
```env
GCP_PROJECT_ID=pravartak-15665
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
PORT=5000
FLASK_ENV=development
VOICE_NAME=en-US-Neural2-F
LANGUAGE_CODE=en-US
SPEAKING_RATE=1.0
VOICE_PITCH=0.0
```

## 🎉 You're All Set!

Everything is configured and ready to go. Just install the Python dependencies and start the servers!

### Quick Start Command:

```powershell
# Terminal 1: Install dependencies and start backend
cd "c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak\backend"
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server_ai_interviewer.py

# Terminal 2: Start frontend
cd "c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak"
npm run dev
```

Then visit: **http://localhost:3000/interview-simulator**

---

**Need Help?** Check the detailed guide in `TALKING_AVATAR_SETUP.md`
