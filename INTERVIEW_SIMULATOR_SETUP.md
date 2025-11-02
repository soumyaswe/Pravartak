# Interview Simulator Integration Guide

## ✅ Completed

The Interview Simulator has been successfully integrated into your Pravartak dashboard!

### What's Been Done:

1. **✅ Sidebar Updated** - Added "Interview Simulator" link in the Interview Prep section
2. **✅ Page Created** - `/interview-simulator` route with full UI
3. **✅ Components Created** - Avatar, converter, and simulator components
4. **✅ Assets Copied** - 3D models, textures, and blend data files
5. **✅ Dependencies Installed** - Three.js, React Three Fiber, Socket.IO, etc.

## 🚀 Next Steps

### Backend Setup Required

The Interview Simulator requires a Python backend server to function. You need to:

#### 1. Copy Backend Files

```powershell
# Copy the Python server files to your project
Copy-Item "D:\Pravartak-S\talking_avatar\server_ai_interviewer.py" -Destination "D:\Pravartak-S\Pravartak\backend\" -Force
Copy-Item "D:\Pravartak-S\talking_avatar\requirements.txt" -Destination "D:\Pravartak-S\Pravartak\backend\" -Force
Copy-Item "D:\Pravartak-S\talking_avatar\gcp-credentials.json" -Destination "D:\Pravartak-S\Pravartak\backend\" -Force
```

#### 2. Install Python Dependencies

```powershell
cd D:\Pravartak-S\Pravartak\backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
```

#### 3. Configure Environment Variables

Create `backend/.env`:

```env
GCP_PROJECT_ID=your-google-cloud-project-id
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
PORT=5000
```

#### 4. Enable Google Cloud APIs

In [Google Cloud Console](https://console.cloud.google.com/):

- ✅ Cloud Text-to-Speech API
- ✅ Cloud Speech-to-Text API
- ✅ Vertex AI API

#### 5. Start the Backend

```powershell
cd D:\Pravartak-S\Pravartak\backend
.\venv\Scripts\Activate
python server_ai_interviewer.py
```

### Frontend Access

Once the backend is running:

1. Start your Next.js app: `npm run dev`
2. Navigate to `http://localhost:3000/dashboard`
3. Click **Interview Simulator** in the sidebar
4. Allow microphone and camera permissions
5. Click **Start Interview** to begin!

## 📁 Project Structure

```
D:\Pravartak-S\Pravartak\
├── app\(main)\interview-simulator\
│   ├── page.jsx                          # Main page
│   └── _components\
│       ├── InterviewSimulator.jsx        # Main simulator component
│       ├── converter.js                  # Animation converter
│       ├── blendData.json                # Morph target data
│       └── blendDataBlink.json           # Blink animations
├── public\
│   ├── model.glb                         # 3D avatar model
│   ├── blendData.json                    # Public blend data
│   └── images\                           # Avatar textures
│       ├── body.webp
│       ├── eyes.webp
│       ├── hair*.webp
│       └── ...
└── backend\                              # Python server (needs setup)
    ├── server_ai_interviewer.py
    ├── requirements.txt
    ├── gcp-credentials.json
    └── .env
```

## 🎯 Features

- **🤖 AI-Powered Interviews** - Gemini AI generates contextual questions
- **🎤 Speech Recognition** - Real-time transcription
- **💬 Natural Responses** - Text-to-speech with lip-sync
- **📹 Live Video** - Shows your webcam during interview
- **🧠 Context Awareness** - Remembers previous answers
- **🎨 Realistic 3D Avatar** - PBR materials and HDR lighting

## 🔧 Troubleshooting

### "Backend not connected"
- Ensure Python server is running on `http://localhost:5000`
- Check console for connection errors

### "No avatar visible"
- Verify `public/model.glb` exists
- Check `public/images/` folder for textures

### "Microphone not working"
- Grant browser permissions
- Check browser console for errors

### "Avatar not speaking"
- Ensure Google Cloud credentials are valid
- Check backend logs for API errors

## 📝 Notes

- Backend must be running before starting interviews
- Google Cloud billing must be enabled
- Chrome/Edge browsers recommended for best compatibility
- Local development requires HTTPS or localhost for media permissions

## 🎉 You're All Set!

Your Interview Simulator is ready to use once you complete the backend setup!

Need help? Check the original `talking_avatar` README at:
`D:\Pravartak-S\talking_avatar\README.md`
