# 🎤 Interview Simulator - Setup Guide

AI-powered interview practice with a realistic 3D avatar, powered by Google Cloud AI services.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Google Cloud Platform account
- Firebase project (for authentication)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Susmita-Codes/Pravartak-AI.git
cd Pravartak-AI

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
python -m venv venv
.\venv\Scripts\Activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
cd ..
```

### 2. Configure Environment Variables

#### Frontend Configuration

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your credentials
```

Fill in these required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_FIREBASE_*` - Firebase configuration
- `GEMINI_API_KEY` - Google Gemini API key
- `GOOGLE_CLOUD_PROJECT_ID` - Your GCP project ID
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to GCP credentials JSON

#### Backend Configuration

```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit backend/.env with your credentials
```

Fill in these required variables:
- `GCP_PROJECT_ID` - Your Google Cloud project ID
- `GEMINI_API_KEY` - Google Gemini API key
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to credentials file

### 3. Set Up Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable these APIs:
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API
   - Vertex AI API
4. Create a service account with these roles:
   - Speech-to-Text User
   - Text-to-Speech User
   - Vertex AI User
5. Download the JSON key file
6. Place it as `backend/gcp-credentials.json`

### 4. Run the Application

#### Terminal 1 - Backend Server
```bash
cd backend
.\venv\Scripts\Activate  # Windows
# source venv/bin/activate  # macOS/Linux
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

#### Terminal 2 - Frontend
```bash
npm run dev
```

Open [http://localhost:3000/interview-simulator](http://localhost:3000/interview-simulator)

---

## 🎯 Features

### ✨ AI-Powered Interviews
- **Intelligent Questions**: Gemini 1.5 Flash generates contextual interview questions
- **Adaptive Responses**: AI analyzes your answers and asks relevant follow-ups
- **Multiple Interview Types**: Technical, behavioral, and role-specific questions

### 🎭 Realistic 3D Avatar
- **Photorealistic Model**: High-quality 3D character with detailed textures
- **Lip-Sync Animation**: Mouth movements synchronized with speech
- **Natural Idle Animations**: Breathing, blinking, subtle movements
- **52 Morph Targets**: Realistic facial expressions

### 🎤 Voice Integration
- **Speech Recognition**: Google Cloud Speech-to-Text for accurate transcription
- **Natural Voice**: Google Neural2 voices (multiple options)
- **Real-time Processing**: Low-latency audio processing
- **Microphone Control**: Easy-to-use recording interface

### 📹 Video Feed
- **Camera Integration**: See yourself during the interview
- **Professional Layout**: Picture-in-picture style
- **Privacy Controls**: Enable/disable camera anytime

---

## 🎨 User Interface

The Interview Simulator features:

- **Full-screen Avatar Canvas**: Immersive 3D experience
- **Control Panel** (Bottom-left):
  - Status indicator (connection, recording, processing)
  - Start Interview button
  - Respond/Stop recording buttons
  - Transcript display (AI & user responses)
- **Video Feed** (Bottom-right): Your webcam with green accent border
- **Dark Theme**: Professional, distraction-free design

---

## 🔧 Configuration Options

### Voice Settings (`backend/.env`)

```env
# Change the avatar's voice
VOICE_NAME=en-US-Neural2-F  # Female voice

# Other options:
# en-US-Neural2-A  # Male voice
# en-US-Neural2-C  # Female voice (alt)
# en-US-Neural2-D  # Male voice (alt)

# Adjust speaking speed (0.25 - 4.0)
SPEAKING_RATE=1.0

# Adjust voice pitch (-20.0 to 20.0)
VOICE_PITCH=0.0
```

### Interview Customization

Edit `backend/server_ai_interviewer.py` to customize:
- Interview topics
- Question difficulty
- Interview duration
- Response evaluation criteria

---

## 📁 Project Structure

```
Pravartak-AI/
├── app/
│   └── (main)/
│       └── interview-simulator/
│           ├── page.jsx                    # Main interview page
│           └── _components/
│               ├── InterviewSimulator.jsx  # 3D avatar & UI
│               ├── converter.js            # Animation utilities
│               ├── blendData.json          # Morph target mappings
│               └── blendDataBlink.json     # Blink animations
├── backend/
│   ├── server_ai_interviewer.py           # Flask + SocketIO server
│   ├── requirements.txt                   # Python dependencies
│   ├── .env.example                       # Backend env template
│   └── gcp-credentials.json              # GCP service account (gitignored)
├── public/
│   ├── model.glb                         # 3D avatar model
│   ├── idle.fbx                          # Idle animation
│   ├── blendData.json                    # Public blend data
│   └── images/                           # Avatar textures & HDR
├── .env.example                          # Frontend env template
├── INTERVIEW_SIMULATOR_SETUP.md          # Detailed setup guide
├── INTERVIEW_SIMULATOR_API_CONFIG.md     # API configuration docs
└── setup-backend.ps1                     # Automated backend setup
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error**: `Import "vertexai" could not be resolved`
```bash
# Ensure you're in the virtual environment
cd backend
.\venv\Scripts\Activate
pip install -r requirements.txt
```

**Error**: `Port 5000 already in use`
```bash
# Find and kill the process (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change port in backend/.env
PORT=5001
```

### Frontend Connection Issues

**Error**: `Backend not connected`
1. Verify backend is running: `http://127.0.0.1:5000`
2. Check browser console for WebSocket errors
3. Ensure `NEXT_PUBLIC_BACKEND_URL` is set in `.env`

**Error**: `Could not load /idle.fbx`
- Ensure `public/idle.fbx` exists
- Check file permissions
- Restart dev server

### Avatar Not Speaking

**Error**: `Text-to-Speech failed`
1. Verify Text-to-Speech API is enabled in GCP Console
2. Check credentials file has correct permissions
3. Ensure project has billing enabled
4. Check backend logs for specific errors

### Microphone Not Working

1. Allow browser microphone permissions
2. Check browser console for errors
3. Ensure using HTTPS or localhost (required for mic access)
4. Try different browser (Chrome recommended)

---

## 💰 Cost Estimates

### Google Cloud Pricing (Monthly)

For ~100 interview sessions (30 min each):

| Service | Usage | Cost |
|---------|-------|------|
| Speech-to-Text | 50 hours | ~$72 |
| Text-to-Speech (Neural2) | ~500K chars | ~$8 |
| Vertex AI (Gemini) | ~10K requests | Free tier |
| **Total** | | **~$80/month** |

### Free Tier Limits
- Speech-to-Text: 60 min/month free
- Text-to-Speech: 4M chars/month free (Neural2)
- Vertex AI: 15 requests/min free

---

## 🔒 Security Best Practices

### Never Commit These Files
```
.env
backend/.env
backend/gcp-credentials.json
*credentials*.json
adminkey.json
```

### Secure Your Credentials
1. Use environment variables in production
2. Rotate API keys regularly
3. Enable GCP IAM restrictions
4. Use Firebase Security Rules
5. Implement rate limiting

---

## 🚀 Deployment

### Backend Deployment Options

1. **Google Cloud Run** (Recommended)
   - Automatic scaling
   - Pay per use
   - HTTPS included

2. **Heroku**
   - Easy deployment
   - WebSocket support
   - Add-ons available

3. **AWS EC2**
   - Full control
   - Custom configuration
   - Cost-effective for high traffic

### Frontend Deployment

1. **Vercel** (Recommended for Next.js)
   ```bash
   npm install -g vercel
   vercel deploy
   ```

2. **Firebase Hosting**
   ```bash
   npm run build
   firebase deploy
   ```

### Environment Variables in Production

Set these in your hosting platform:
- All variables from `.env.example`
- `NODE_ENV=production`
- `NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com`

---

## 📚 Additional Documentation

- **[INTERVIEW_SIMULATOR_SETUP.md](./INTERVIEW_SIMULATOR_SETUP.md)** - Detailed setup instructions
- **[INTERVIEW_SIMULATOR_API_CONFIG.md](./INTERVIEW_SIMULATOR_API_CONFIG.md)** - API keys & services
- **[INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md)** - Integration summary

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

This project is part of Pravartak-AI. See [LICENSE](./LICENSE) for details.

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/Susmita-Codes/Pravartak-AI/issues)
- **Documentation**: Check the `/docs` folder
- **Email**: Contact the maintainers

---

**Built with ❤️ using Next.js, Three.js, Flask, and Google Cloud AI**

**Last Updated**: November 2, 2025
