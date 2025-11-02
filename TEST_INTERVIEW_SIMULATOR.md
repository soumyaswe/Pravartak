# Test Interview Simulator - Quick Start Guide

## Prerequisites

1. **Backend Server Running** on `http://127.0.0.1:5000`
2. **Google Cloud Project** configured with:
   - Text-to-Speech API enabled
   - Speech-to-Text API enabled
   - Vertex AI API enabled
   - Service account credentials configured

3. **Environment Variables** in `backend/.env`:
   ```
   GCP_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
   SPEAKING_RATE=0.85
   VOICE_NAME=en-US-Neural2-F
   VOICE_PITCH=0.0
   ```

## Start Backend Server

```powershell
# Navigate to backend directory
cd c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak\backend

# Activate virtual environment (if you have one)
# .\venv\Scripts\Activate.ps1

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Start the server
python server_ai_interviewer.py
```

**Expected Output:**
```
🚀 AI Interviewer Avatar Server Starting...
📍 Host: 127.0.0.1
🔌 Port: 5000
🤖 AI Model: Gemini 2.5 Flash
🎤 Speech-to-Text: Enabled
🔊 Text-to-Speech: Enabled
```

## Start Frontend

```powershell
# Open new terminal
# Navigate to project root
cd c:\Users\bsubh\OneDrive\Desktop\VS Code\Pravartak

# Start Next.js development server
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

## Test the Interview Simulator

### Step 1: Open Interview Simulator
1. Open browser: `http://localhost:3000`
2. Navigate to Interview Simulator page
3. Allow microphone and camera permissions when prompted

### Step 2: Setup Interview
1. **Check Status Indicators** - All should be green:
   - ✅ Microphone Ready
   - ✅ Camera Ready
   - ✅ Server Connected

2. **Select Position** from dropdown:
   - Software Engineer
   - Product Manager
   - Data Scientist
   - etc.

3. **Click "Start Interview"**

### Step 3: AI Greeting (TEST POINT #1)
**Expected Behavior:**
- AI avatar should automatically speak a greeting
- Example: "Hello! I'm Alex, your AI interviewer. Today I'll be interviewing you for the Software Engineer position. Please tell me a bit about yourself."
- Audio should play
- Avatar's mouth should move (lip sync)
- Transcript should appear if you open the transcript panel

**✅ PASS:** AI greets you automatically
**❌ FAIL:** No greeting or error message

### Step 4: Record Your Response (TEST POINT #2)

1. **Click "Respond" Button** (green message icon)
   - Status should show: "🎤 Recording... Speak clearly into your microphone"
   - Button should turn red and pulsing
   - Microphone must NOT be muted (check microphone icon is not red)

2. **Speak Clearly** (at least 1-2 seconds):
   - Example: "Hi, I'm [your name], a software developer with 5 years of experience in web development."
   - Speak at normal volume
   - Avoid background noise

3. **Click "Stop" Button** (red checkmark icon)
   - Status should show: "🔄 Processing your answer... Please wait"

### Step 5: Verify Transcription (TEST POINT #3)
**Expected Behavior:**
- After 1-3 seconds, you should see:
  - Status: "You said: '[your speech]' (XX% confidence)"
  - Your transcript appears in the transcript panel
  - Confidence should be >70% for clear speech

**✅ PASS:** Your speech is transcribed accurately
**❌ FAIL:** No transcription or error message

### Step 6: AI Follow-up Question (TEST POINT #4)
**Expected Behavior:**
- AI generates a follow-up question based on your answer
- Example: "That's great! Can you tell me about a challenging project you worked on?"
- Avatar speaks and lip-syncs
- Transcript updates

**✅ PASS:** AI responds with relevant follow-up
**❌ FAIL:** No response or generic error

### Step 7: Full Conversation Test
**Repeat Steps 4-6** for 3-5 exchanges:
- Click "Respond"
- Answer the AI's question
- Click "Stop"
- Wait for transcription
- Wait for AI response
- Repeat

### Step 8: Check Transcript Panel
1. **Click Transcript Icon** (file icon at bottom)
2. **Verify:**
   - All AI questions are listed
   - All your answers are listed
   - Messages are in correct order
   - Color-coded correctly (purple=AI, blue=You)

## Common Issues & Solutions

### Issue 1: No Audio Captured
**Symptoms:** "No audio captured. Please check your microphone."

**Solutions:**
- Check microphone permissions in browser
- Ensure microphone is not muted (microphone icon should be white, not red)
- Try a different browser (Chrome/Edge recommended)
- Check Windows microphone settings

### Issue 2: Audio Too Short
**Symptoms:** "Audio too short. Please speak for at least 1 second."

**Solutions:**
- Speak for at least 2 seconds
- Don't click stop too quickly
- Speak at normal volume, not whisper

### Issue 3: Unclear Audio
**Symptoms:** AI says "I didn't quite catch that..."

**Solutions:**
- Speak louder and clearer
- Move closer to microphone
- Reduce background noise
- Check microphone quality

### Issue 4: No AI Greeting
**Symptoms:** No greeting when starting interview

**Solutions:**
- Check backend server is running
- Check console for errors (F12 → Console tab)
- Verify GCP credentials are configured
- Check internet connection for Gemini API

### Issue 5: Connection Lost
**Symptoms:** "Connection lost" or "Disconnected from server"

**Solutions:**
- Check backend server is still running
- Restart backend server
- Refresh browser page
- Check firewall isn't blocking port 5000

## Backend Logs to Monitor

When testing, watch the backend console for these logs:

**On Start Interview:**
```
🎤 Starting interview for session: <session_id>, position: Software Engineer
📤 Getting initial greeting for Software Engineer position...
🗣️ AI says: [greeting text]
```

**On Recording:**
```
🎙️ Audio stream started for session: <session_id>
📊 Chunk: 4000 samples at 16kHz (from 12000 at 48000Hz)
📊 Chunk: 4000 samples at 16kHz (from 12000 at 48000Hz)
...
```

**On Stop Recording:**
```
🎧 Processing 32000 audio samples for session: <session_id>
🎯 Sending 64000 bytes (2.00s) to Speech-to-Text API...
📝 Transcription: "I am a software developer..." (confidence: 95%)
🤖 Getting AI response for: "I am a software developer..."
✅ AI response: [response text]
```

## Success Criteria

✅ **All tests pass if:**
1. AI greets you automatically when starting
2. Your voice is captured and transcribed accurately (>70% confidence)
3. AI responds with relevant follow-up questions
4. Conversation flows naturally for 3+ exchanges
5. Full transcript is visible in transcript panel
6. No error messages appear

## Performance Metrics

**Expected Response Times:**
- AI Greeting: 2-4 seconds
- Transcription: 1-3 seconds after stopping
- AI Response: 2-5 seconds
- Total cycle: 5-10 seconds per exchange

## Report Issues

If you encounter issues, collect:
1. Browser console logs (F12 → Console)
2. Backend server logs
3. Steps to reproduce
4. Audio file (if available)
5. Browser and OS version

## Next Steps After Testing

If all tests pass:
1. ✅ Mark as production-ready
2. Deploy to production environment
3. Monitor real user interactions
4. Collect feedback for improvements

If tests fail:
1. Note which test failed
2. Check solutions above
3. Review backend/frontend logs
4. Debug specific issue
5. Re-test after fixes
