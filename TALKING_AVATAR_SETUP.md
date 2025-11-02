# 🎭 Talking Avatar Setup Guide for Pravartak Interview Simulator

## ✅ What's Already Implemented

The talking avatar system has been fully integrated into your Interview Simulator! Here's what's ready:

### Frontend (Already in place)
- ✅ `app/(main)/interview-simulator/_components/InterviewSimulator.jsx` - Main component with 3D avatar
- ✅ `app/(main)/interview-simulator/_components/converter.js` - Animation converter
- ✅ `app/(main)/interview-simulator/_components/blendDataBlink.json` - Blink animation data
- ✅ `/public/model.glb` - 3D avatar model
- ✅ `/public/idle.fbx` - Idle animation
- ✅ `/public/images/` - All textures (body, eyes, teeth, hair, etc.)

### Backend (Already in place)
- ✅ `backend/server_ai_interviewer.py` - Flask server with Socket.IO
- ✅ `backend/requirements.txt` - Python dependencies
- ✅ `backend/.env` - Environment configuration (just created)
- ✅ `backend/gcp-credentials.json` - GCP service account credentials

## 🚀 Quick Start (4 Steps)

### Step 1: Install Backend Dependencies

Open a PowerShell terminal in the `backend` folder:

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Verify GCP Credentials

Make sure `backend/gcp-credentials.json` exists. If not, copy it from the root:

```powershell
# From the Pravartak root directory
Copy-Item flash-precept-471409-u3-0a2cc0ca3940.json backend/gcp-credentials.json
```

### Step 3: Start the Backend Server

```powershell
# From the backend directory (with venv activated)
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

### Step 4: Start the Frontend

In a **new PowerShell terminal** from the Pravartak root:

```powershell
npm run dev
```

Then navigate to: **http://localhost:3000/interview-simulator**

## 🎯 How to Use the Interview Simulator

1. **Lobby Screen**:
   - You'll see your camera preview
   - Select an interview position from the dropdown (e.g., "Software Engineer")
   - Click "Start Interview"

2. **Interview Room**:
   - The 3D avatar will greet you and ask the first question
   - Listen to the AI interviewer
   - Click the **green "Respond" button** (or press and hold) to answer
   - Click **"Stop"** when you're done answering
   - The AI will process your response and ask a follow-up question

3. **Controls**:
   - 🎤 **Microphone**: Toggle mute/unmute
   - 💬 **Respond**: Push-to-talk (hold to record your answer)
   - 📹 **Camera**: Toggle video on/off
   - 📄 **Transcript**: View conversation history
   - ☎️ **End Call**: Exit the interview

## 🔧 Configuration

### Voice Settings
Edit `backend/.env` to customize the voice:

```env
# Change voice (options: en-US-Neural2-A, en-US-Neural2-C, en-US-Neural2-F)
VOICE_NAME=en-US-Neural2-F

# Adjust speaking speed (0.25 to 4.0)
SPEAKING_RATE=1.0

# Adjust pitch (-20.0 to 20.0)
VOICE_PITCH=0.0
```

### Interview Positions
Edit `InterviewSimulator.jsx` to add more positions:

```javascript
const INTERVIEW_POSITIONS = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  // Add your own!
  'Your Custom Position',
];
```

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Make sure you're in the backend directory
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Check if all packages are installed
pip list

# Reinstall if needed
pip install -r requirements.txt
```

### "Socket connection failed"
- Make sure the backend server is running on port 5000
- Check that no firewall is blocking the connection
- Verify the backend console shows "✅ Client connected"

### "No audio from avatar"
- Check your system volume
- Look for "🎵 Audio ready" in the browser console
- Verify the `backend/audio_files/` folder is being created

### Avatar not animating
- Check browser console for errors
- Verify all texture files exist in `/public/images/`
- Make sure `model.glb` and `idle.fbx` exist in `/public/`

### Camera/microphone not working
- Grant browser permissions when prompted
- Check browser settings (chrome://settings/content/camera)
- Try a different browser (Chrome/Edge recommended)

## 📁 Project Structure

```
Pravartak/
├── app/
│   └── (main)/
│       └── interview-simulator/
│           ├── page.jsx                    # Main page wrapper
│           └── _components/
│               ├── InterviewSimulator.jsx  # 3D Avatar + UI
│               ├── converter.js            # Animation converter
│               └── blendDataBlink.json     # Blink animation
├── public/
│   ├── model.glb                           # 3D avatar model
│   ├── idle.fbx                            # Idle animation
│   └── images/                             # Textures
│       ├── body.webp
│       ├── eyes.webp
│       ├── teeth_diffuse.webp
│       └── ... (more textures)
├── backend/
│   ├── server_ai_interviewer.py           # Flask backend
│   ├── requirements.txt                    # Python deps
│   ├── .env                                # Config
│   ├── gcp-credentials.json               # GCP keys
│   └── audio_files/                        # Generated audio (created automatically)
└── package.json                            # Node deps (already has socket.io-client, three.js, etc.)
```

## 🎨 Customization Ideas

1. **Change Avatar Appearance**:
   - Replace `model.glb` with your own 3D model
   - Update textures in `/public/images/`

2. **Modify AI Behavior**:
   - Edit the system prompt in `server_ai_interviewer.py`
   - Adjust question difficulty or topics

3. **Add Features**:
   - Recording/playback of interviews
   - Sentiment analysis of responses
   - Multi-language support
   - Custom feedback system

## 🔐 Security Notes

- Never commit `.env` files or `gcp-credentials.json` to git
- These files are already in `.gitignore`
- Keep your GCP credentials secure

## 📞 Need Help?

If you encounter issues:

1. Check the backend console for Python errors
2. Check the browser console (F12) for JavaScript errors
3. Verify all files are in the correct locations
4. Make sure both frontend (port 3000) and backend (port 5000) are running

## 🎉 You're All Set!

The talking avatar is now fully integrated into your Interview Simulator. Start both servers and enjoy your AI interviewer!

---

**Quick Start Commands:**

Terminal 1 (Backend):
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python server_ai_interviewer.py
```

Terminal 2 (Frontend):
```powershell
npm run dev
```

Then visit: **http://localhost:3000/interview-simulator**
