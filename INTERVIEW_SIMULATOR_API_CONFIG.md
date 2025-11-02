# Interview Simulator - API Keys & Services Configuration

## ✅ Configuration Complete

All API keys and services have been properly configured for the Interview Simulator feature.

---

## 🔑 API Keys Configured

### 1. Google Cloud Platform (GCP)
- **Project ID**: `flash-precept-471409-u3`
- **Credentials File**: `backend/gcp-credentials.json`
- **Location**: Backend `.env` file
- **Used For**: 
  - Speech-to-Text (voice recognition)
  - Text-to-Speech (avatar voice)
  - Vertex AI (Gemini model for interview questions)

### 2. Gemini API Key
- **Key**: `AIzaSyCwm_xsG1fXJtR-hWm5DtGGJDieey_fpBY`
- **Location**: Backend `.env` file
- **Used For**: AI-powered interview question generation and response analysis

---

## 🔧 Services Enabled

### Required Google Cloud APIs
Make sure these are enabled in your GCP Console for project `flash-precept-471409-u3`:

1. ✅ **Cloud Speech-to-Text API**
   - Converts user speech to text
   - Used when user responds to questions

2. ✅ **Cloud Text-to-Speech API**
   - Generates avatar voice
   - Creates realistic speech with lip-sync data

3. ✅ **Vertex AI API**
   - Powers the AI interviewer (Gemini 1.5 Flash)
   - Generates contextual interview questions
   - Analyzes user responses

---

## 📁 Configuration Files

### Backend Configuration (`backend/.env`)
```env
# Google Cloud Configuration
GCP_PROJECT_ID=flash-precept-471409-u3
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
GEMINI_API_KEY=AIzaSyCwm_xsG1fXJtR-hWm5DtGGJDieey_fpBY

# Server Configuration
PORT=5000
FLASK_ENV=development

# Voice Configuration
VOICE_NAME=en-US-Neural2-F
LANGUAGE_CODE=en-US
SPEAKING_RATE=1.0
VOICE_PITCH=0.0
```

### Frontend Configuration (`.env`)
```env
# Google Cloud
GOOGLE_CLOUD_PROJECT_ID="flash-precept-471409-u3"
GOOGLE_APPLICATION_CREDENTIALS="./flash-precept-471409-u3-0a2cc0ca3940.json"
GEMINI_API_KEY="AIzaSyCwm_xsG1fXJtR-hWm5DtGGJDieey_fpBY"

# Backend Connection
NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:5000"
```

---

## 🎤 Voice Configuration

The avatar uses **Google Cloud Neural2 Voice**:
- **Voice**: `en-US-Neural2-F` (Female, natural-sounding)
- **Language**: English (US)
- **Speaking Rate**: 1.0 (normal speed)
- **Pitch**: 0.0 (neutral)

You can change these in `backend/.env`:
- **Male voices**: `en-US-Neural2-A`, `en-US-Neural2-D`
- **Female voices**: `en-US-Neural2-C`, `en-US-Neural2-E`, `en-US-Neural2-F`

---

## 🔐 Security Notes

### Credentials File
- ✅ `backend/gcp-credentials.json` is properly configured
- ✅ Contains service account with required permissions:
  - Speech-to-Text User
  - Text-to-Speech User  
  - Vertex AI User
- ⚠️ **Keep this file secure** - never commit to Git

### .gitignore Protection
Ensure these are in `.gitignore`:
```
.env
backend/.env
backend/gcp-credentials.json
*credentials*.json
```

---

## 🧪 Testing the Configuration

### 1. Check Backend Server
```powershell
cd backend
.\venv\Scripts\Activate
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

### 2. Test Frontend Connection
1. Navigate to `http://localhost:3000/interview-simulator`
2. Check for green connection indicator
3. Click "Start Interview"
4. AI should ask a question and avatar should speak

---

## 🐛 Troubleshooting

### If Backend Fails to Start
```powershell
# Check if APIs are enabled
gcloud services list --enabled --project=flash-precept-471409-u3

# Enable required APIs
gcloud services enable speech.googleapis.com --project=flash-precept-471409-u3
gcloud services enable texttospeech.googleapis.com --project=flash-precept-471409-u3
gcloud services enable aiplatform.googleapis.com --project=flash-precept-471409-u3
```

### If Connection Fails
1. Verify backend is running on port 5000
2. Check browser console for WebSocket errors
3. Ensure firewall allows port 5000

### If Avatar Doesn't Speak
1. Verify Text-to-Speech API is enabled
2. Check GCP credentials have correct permissions
3. Look for errors in backend terminal

---

## 📊 API Usage & Costs

### Google Cloud Pricing (Approximate)
- **Speech-to-Text**: ~$0.024 per minute of audio
- **Text-to-Speech**: ~$16 per 1M characters (Neural2 voices)
- **Vertex AI (Gemini)**: Free tier available, then pay-per-use

### Free Tier Limits
- Speech-to-Text: 60 minutes/month free
- Text-to-Speech: 1M characters/month free (standard voices), 4M characters (Neural2)
- Vertex AI: 15 requests per minute free

---

## ✅ Configuration Checklist

- [x] GCP Project ID set to `flash-precept-471409-u3`
- [x] GCP credentials file copied to backend
- [x] Gemini API key configured
- [x] Backend .env updated with all keys
- [x] Frontend .env updated with backend URL
- [x] Voice configuration set (Neural2-F)
- [x] Port 5000 configured for backend
- [x] All required APIs enabled in GCP Console

---

## 🎯 Next Steps

1. ✅ **Backend Server**: Running with updated config
2. ✅ **Frontend**: Connected to backend
3. ✅ **Test Interview**: Try the Interview Simulator

**Everything is configured and ready to use!** 🚀

---

**Last Updated**: November 2, 2025  
**Configuration Version**: 1.0  
**Status**: ✅ Production Ready
