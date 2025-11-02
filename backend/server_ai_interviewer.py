"""
Flask SocketIO backend server for AI Interviewer Avatar
Integrates GCP Text-to-Speech, Speech-to-Text, and Vertex AI (Gemini)
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from google.cloud import texttospeech, speech
import vertexai
from vertexai.preview.generative_models import GenerativeModel
import os
import json
import uuid
from datetime import datetime
import io
import base64
import threading
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enable CORS for React frontend
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize SocketIO with CORS
socketio = SocketIO(app, cors_allowed_origins=[
    "http://localhost:3000",
    "http://localhost:8000", 
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000"
], async_mode='eventlet')

# Initialize Google Cloud clients
tts_client = texttospeech.TextToSpeechClient()
stt_client = speech.SpeechClient()

# Initialize Vertex AI (Gemini)
# Make sure to set GOOGLE_CLOUD_PROJECT environment variable
project_id = os.environ.get('GCP_PROJECT_ID', 'your-project-id')
vertexai.init(project=project_id, location="us-central1")
gemini_model = GenerativeModel("gemini-1.5-flash")

# Directory to store generated audio files
AUDIO_DIR = 'audio_files'
os.makedirs(AUDIO_DIR, exist_ok=True)

# Store active chat sessions per socket connection
chat_sessions = {}
conversation_histories = {}

# Store active audio streaming sessions
audio_stream_buffers = {}
stt_stream_configs = {}

# Viseme mapping: Maps phonemes to facial blend shape indices
PHONEME_TO_VISEME_MAP = {
    # Silence
    'sil': 0, 'pau': 0,
    
    # Vowels
    'AA': 1, 'aa': 1, 'AE': 2, 'ae': 2, 'AH': 3, 'ah': 3,
    'AO': 4, 'ao': 4, 'AW': 5, 'aw': 5, 'AY': 6, 'ay': 6,
    'EH': 7, 'eh': 7, 'ER': 8, 'er': 8, 'EY': 9, 'ey': 9,
    'IH': 10, 'ih': 10, 'IY': 11, 'iy': 11, 'OW': 12, 'ow': 12,
    'OY': 13, 'oy': 13, 'UH': 14, 'uh': 14, 'UW': 15, 'uw': 15,
    
    # Consonants
    'B': 16, 'b': 16, 'CH': 17, 'ch': 17, 'D': 18, 'd': 18,
    'DH': 19, 'dh': 19, 'F': 20, 'f': 20, 'G': 21, 'g': 21,
    'HH': 22, 'hh': 22, 'JH': 17, 'jh': 17, 'K': 21, 'k': 21,
    'L': 23, 'l': 23, 'M': 16, 'm': 16, 'N': 18, 'n': 18,
    'NG': 21, 'ng': 21, 'P': 16, 'p': 16, 'R': 24, 'r': 24,
    'S': 25, 's': 25, 'SH': 17, 'sh': 17, 'T': 18, 't': 18,
    'TH': 26, 'th': 26, 'V': 20, 'v': 20, 'W': 15, 'w': 15,
    'Y': 11, 'y': 11, 'Z': 25, 'z': 25, 'ZH': 17, 'zh': 17,
}

BLEND_SHAPES = [
    'mouthClose', 'mouthFunnel', 'mouthPucker', 'mouthLeft', 'mouthRight',
    'mouthSmileLeft', 'mouthSmileRight', 'mouthFrownLeft', 'mouthFrownRight',
    'mouthDimpleLeft', 'mouthDimpleRight', 'mouthStretchLeft', 'mouthStretchRight',
    'mouthRollLower', 'mouthRollUpper', 'mouthShrugLower', 'mouthShrugUpper',
    'mouthPressLeft', 'mouthPressRight', 'mouthLowerDownLeft', 'mouthLowerDownRight',
    'mouthUpperUpLeft', 'mouthUpperUpRight', 'browDownLeft', 'browDownRight',
    'browInnerUp', 'browOuterUpLeft', 'browOuterUpRight', 'cheekPuff', 'cheekSquintLeft',
    'cheekSquintRight', 'noseSneerLeft', 'noseSneerRight', 'tongueOut', 'jawForward',
    'jawLeft', 'jawRight', 'jawOpen', 'eyeBlinkLeft', 'eyeBlinkRight',
    'eyeLookDownLeft', 'eyeLookDownRight', 'eyeLookInLeft', 'eyeLookInRight',
    'eyeLookOutLeft', 'eyeLookOutRight', 'eyeLookUpLeft', 'eyeLookUpRight',
    'eyeSquintLeft', 'eyeSquintRight', 'eyeWideLeft', 'eyeWideRight'
]


def phoneme_to_blend_shapes(phoneme, intensity=1.0):
    """Convert a phoneme to blend shape values"""
    blend_values = {shape: 0.0 for shape in BLEND_SHAPES}
    
    viseme_index = PHONEME_TO_VISEME_MAP.get(phoneme, 0)
    
    if viseme_index == 0:  # Silence/neutral - Keep mouth fully closed
        blend_values['mouthClose'] = 1.0 * intensity
        blend_values['jawOpen'] = 0.0  # Explicitly set jaw closed
    elif viseme_index in [1, 2, 3]:  # Open vowels
        blend_values['jawOpen'] = 0.6 * intensity
        blend_values['mouthFunnel'] = 0.3 * intensity
    elif viseme_index in [4, 12]:  # O sounds
        blend_values['jawOpen'] = 0.4 * intensity
        blend_values['mouthFunnel'] = 0.7 * intensity
        blend_values['mouthPucker'] = 0.5 * intensity
    elif viseme_index in [5, 6]:  # Diphthongs
        blend_values['jawOpen'] = 0.5 * intensity
        blend_values['mouthStretchLeft'] = 0.3 * intensity
        blend_values['mouthStretchRight'] = 0.3 * intensity
    elif viseme_index in [7, 9]:  # E sounds
        blend_values['jawOpen'] = 0.3 * intensity
        blend_values['mouthSmileLeft'] = 0.4 * intensity
        blend_values['mouthSmileRight'] = 0.4 * intensity
    elif viseme_index in [10, 11]:  # I sounds
        blend_values['jawOpen'] = 0.2 * intensity
        blend_values['mouthStretchLeft'] = 0.5 * intensity
        blend_values['mouthStretchRight'] = 0.5 * intensity
    elif viseme_index in [14, 15]:  # U sounds
        blend_values['mouthPucker'] = 0.7 * intensity
        blend_values['jawOpen'] = 0.2 * intensity
    elif viseme_index == 16:  # Bilabials
        blend_values['mouthClose'] = 0.9 * intensity
        blend_values['mouthPressLeft'] = 0.5 * intensity
        blend_values['mouthPressRight'] = 0.5 * intensity
    elif viseme_index == 17:  # Palatals
        blend_values['jawOpen'] = 0.2 * intensity
        blend_values['mouthFunnel'] = 0.4 * intensity
    elif viseme_index == 18:  # Alveolars
        blend_values['jawOpen'] = 0.3 * intensity
        blend_values['mouthRollUpper'] = 0.3 * intensity
    elif viseme_index == 19:  # Dental
        blend_values['jawOpen'] = 0.3 * intensity
        blend_values['tongueOut'] = 0.5 * intensity
    elif viseme_index == 20:  # Labiodentals
        blend_values['mouthRollLower'] = 0.6 * intensity
        blend_values['jawOpen'] = 0.2 * intensity
    elif viseme_index == 21:  # Velars
        blend_values['jawOpen'] = 0.4 * intensity
    elif viseme_index == 23:  # L
        blend_values['jawOpen'] = 0.3 * intensity
        blend_values['tongueOut'] = 0.3 * intensity
    elif viseme_index == 24:  # R
        blend_values['mouthFunnel'] = 0.4 * intensity
        blend_values['jawOpen'] = 0.3 * intensity
    elif viseme_index == 25:  # Sibilants
        blend_values['mouthStretchLeft'] = 0.3 * intensity
        blend_values['mouthStretchRight'] = 0.3 * intensity
        blend_values['jawOpen'] = 0.1 * intensity
    elif viseme_index == 26:  # TH
        blend_values['jawOpen'] = 0.2 * intensity
        blend_values['tongueOut'] = 0.4 * intensity
    
    return blend_values


def generate_blend_data_from_text(text, speaking_rate=1.0):
    """Generate blend shape animation data from text with adjusted timing"""
    # Adjust character speed based on speaking rate (slower rate = more time per character)
    chars_per_second = 15 / speaking_rate
    duration = max(len(text) / chars_per_second, 0.5)
    
    fps = 60
    total_frames = int(duration * fps)
    blend_data = []
    
    words = text.split()
    time_per_word = duration / max(len(words), 1)
    
    for frame in range(total_frames):
        current_time = frame / fps
        word_index = int(current_time / time_per_word)
        if word_index >= len(words):
            word_index = len(words) - 1
        
        intensity = 0.5 + 0.5 * abs((frame % 20) - 10) / 10.0
        
        if frame % 10 < 5:
            blend_values = phoneme_to_blend_shapes('AA', intensity)
        else:
            blend_values = phoneme_to_blend_shapes('M', intensity)
        
        frame_data = {'blendshapes': blend_values}
        blend_data.append(frame_data)
    
    neutral_values = phoneme_to_blend_shapes('sil', 1.0)
    final_frame = {'blendshapes': neutral_values}
    blend_data.append(final_frame)
    
    return blend_data


def generate_speech_and_animation(text):
    """Generate speech audio and blend shape data"""
    try:
        # Configure TTS
        synthesis_input = texttospeech.SynthesisInput(text=text)
        
        # Get speaking rate from environment or use default
        speaking_rate = float(os.environ.get('SPEAKING_RATE', '0.85'))
        
        voice = texttospeech.VoiceSelectionParams(
            language_code='en-US',
            name=os.environ.get('VOICE_NAME', 'en-US-Neural2-F'),
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=speaking_rate,  # Slower for better lip-sync
            pitch=float(os.environ.get('VOICE_PITCH', '0.0')),
        )
        
        # Synthesize speech
        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        # Save audio file
        filename = f'{uuid.uuid4()}.mp3'
        filepath = os.path.join(AUDIO_DIR, filename)
        
        with open(filepath, 'wb') as audio_file:
            audio_file.write(response.audio_content)
        
        # Generate blend data (with adjusted timing for slower speech)
        blend_data = generate_blend_data_from_text(text, speaking_rate)
        
        return blend_data, f'/audio/{filename}'
    
    except Exception as e:
        print(f'Error generating speech: {str(e)}')
        raise


def get_ai_response(session_id, user_text):
    """Get AI interviewer response using Gemini"""
    try:
        # Initialize chat session if it doesn't exist
        if session_id not in chat_sessions:
            # Create system prompt for the AI interviewer
            system_instruction = """You are Alex, a professional and friendly AI interviewer conducting a technical interview for a Senior Software Developer position.

Your responsibilities:
- Ask relevant technical and behavioral questions
- Listen actively to the candidate's responses
- Ask follow-up questions based on their answers
- Keep questions concise and clear (1-3 sentences max)
- Be encouraging and professional
- Cover topics like: technical skills, project experience, problem-solving, teamwork, and career goals

Start with a warm greeting and ask about their background."""

            chat_sessions[session_id] = gemini_model.start_chat()
            conversation_histories[session_id] = []
            
            # Get initial greeting
            initial_prompt = "Start the interview with a warm, professional greeting and your first question about the candidate's background. Keep it to 2-3 sentences."
            response = chat_sessions[session_id].send_message(initial_prompt)
            ai_response = response.text
            
            conversation_histories[session_id].append({
                'role': 'interviewer',
                'content': ai_response
            })
            
            return ai_response
        
        # Add user's response to history
        conversation_histories[session_id].append({
            'role': 'candidate',
            'content': user_text
        })
        
        # Generate follow-up question
        prompt = f"""The candidate just said: "{user_text}"

Based on their response, ask a relevant follow-up question or move to the next topic. Keep your response to 1-3 sentences. Be natural and conversational."""
        
        response = chat_sessions[session_id].send_message(prompt)
        ai_response = response.text
        
        # Add AI's response to history
        conversation_histories[session_id].append({
            'role': 'interviewer',
            'content': ai_response
        })
        
        return ai_response
    
    except Exception as e:
        print(f'Error getting AI response: {str(e)}')
        return "I'm having trouble processing that. Could you please repeat?"


def get_ai_response_streaming(session_id, user_text):
    """Get AI interviewer response using Gemini with streaming"""
    try:
        print(f'🤖 Getting AI response for session: {session_id}')
        print(f'📝 User text: {user_text}')
        
        # Initialize chat session if it doesn't exist
        if session_id not in chat_sessions:
            print(f'🆕 Creating new chat session for: {session_id}')
            chat_sessions[session_id] = gemini_model.start_chat()
            conversation_histories[session_id] = []
            
            # Get initial greeting with streaming
            initial_prompt = "Start the interview with a warm, professional greeting and your first question about the candidate's background. Keep it to 2-3 sentences."
            print(f'📤 Sending initial prompt to Gemini...')
            response_stream = chat_sessions[session_id].send_message(
                initial_prompt,
                stream=True
            )
            
            full_response = ""
            for chunk in response_stream:
                if chunk.text:
                    full_response += chunk.text
                    yield chunk.text
            
            conversation_histories[session_id].append({
                'role': 'interviewer',
                'content': full_response
            })
            print(f'✅ Initial response complete: {full_response}')
            return
        
        # Add user's response to history
        conversation_histories[session_id].append({
            'role': 'candidate',
            'content': user_text
        })
        
        # Generate follow-up question with streaming
        prompt = f"""The candidate just said: "{user_text}"

Based on their response, ask a relevant follow-up question or move to the next topic. Keep your response to 1-3 sentences. Be natural and conversational."""
        
        print(f'📤 Sending follow-up prompt to Gemini...')
        response_stream = chat_sessions[session_id].send_message(
            prompt,
            stream=True
        )
        
        full_response = ""
        for chunk in response_stream:
            if chunk.text:
                full_response += chunk.text
                yield chunk.text
        
        # Add AI's response to history
        conversation_histories[session_id].append({
            'role': 'interviewer',
            'content': full_response
        })
        print(f'✅ Follow-up response complete: {full_response}')
    
    except Exception as e:
        error_msg = f'Error getting AI response: {str(e)}'
        print(f'❌ {error_msg}')
        import traceback
        traceback.print_exc()
        yield "I'm having trouble processing that. Could you please repeat?"


# ==================== WebSocket Events ====================

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f'✅ Client connected: {request.sid}')
    emit('connection_response', {'status': 'connected', 'session_id': request.sid})


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f'❌ Client disconnected: {request.sid}')
    # Clean up chat session
    if request.sid in chat_sessions:
        del chat_sessions[request.sid]
    if request.sid in conversation_histories:
        del conversation_histories[request.sid]


@socketio.on('start_interview')
def handle_start_interview(data):
    """Initialize the interview with a greeting"""
    try:
        session_id = request.sid
        position = data.get('position', 'Software Engineer') if data else 'Software Engineer'
        print(f'🎤 Starting interview for session: {session_id}, position: {position}')
        
        # Get initial AI greeting
        ai_greeting = get_ai_response(session_id, "")
        
        # Generate speech and animation
        blend_data, audio_filename = generate_speech_and_animation(ai_greeting)
        
        # Send to client
        emit('avatar_speaks', {
            'blendData': blend_data,
            'filename': audio_filename,
            'transcript': ai_greeting
        })
        
        print(f'🗣️ AI says: {ai_greeting}')
    
    except Exception as e:
        print(f'Error starting interview: {str(e)}')
        emit('error', {'message': str(e)})


@socketio.on('audio_stream_start')
def handle_audio_stream_start():
    """Handle start of audio streaming"""
    session_id = request.sid
    print(f'🎙️ Audio stream started for session: {session_id}')
    
    # Initialize buffer for this session
    audio_stream_buffers[session_id] = []
    
    emit('stream_ready', {'status': 'ready'})


@socketio.on('audio_stream_data')
def handle_audio_stream_data(data):
    """Handle incoming audio data chunks from client"""
    try:
        session_id = request.sid
        audio_chunk = data.get('audio', [])
        
        # Accumulate audio chunks in buffer
        if session_id not in audio_stream_buffers:
            audio_stream_buffers[session_id] = []
        
        audio_stream_buffers[session_id].extend(audio_chunk)
        
    except Exception as e:
        print(f'❌ Error processing audio chunk: {str(e)}')


@socketio.on('audio_chunk')
def handle_audio_chunk(data):
    """Handle incoming audio chunk from client (legacy support)"""
    try:
        # This is a simplified version - in production, you'd accumulate chunks
        # and use streaming recognition with GCP Speech-to-Text
        pass
    except Exception as e:
        print(f'Error processing audio chunk: {str(e)}')


@socketio.on('audio_stream_end')
def handle_audio_stream_end(data=None):
    """Handle end of audio streaming and process the complete audio"""
    try:
        session_id = request.sid
        
        # Get accumulated audio from buffer
        if session_id not in audio_stream_buffers or not audio_stream_buffers[session_id]:
            print(f'⚠️ No audio data buffered for session: {session_id}')
            emit('error', {'message': 'No audio data received'})
            return
        
        print(f'🎧 Processing {len(audio_stream_buffers[session_id])} audio samples for session: {session_id}')
        
        # Convert PCM samples to bytes
        import struct
        audio_bytes = struct.pack(f'{len(audio_stream_buffers[session_id])}h', *audio_stream_buffers[session_id])
        
        # Clear the buffer
        audio_stream_buffers[session_id] = []
        
        # Configure Speech-to-Text for LINEAR16 PCM
        audio = speech.RecognitionAudio(content=audio_bytes)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=48000,
            language_code='en-US',
            enable_automatic_punctuation=True,
        )
        
        # Transcribe audio
        response = stt_client.recognize(config=config, audio=audio)
        
        if not response.results:
            emit('transcription_result', {'transcript': '', 'confidence': 0})
            return
        
        # Get the transcript
        transcript = response.results[0].alternatives[0].transcript
        confidence = response.results[0].alternatives[0].confidence
        
        print(f'📝 Transcription: {transcript} (confidence: {confidence})')
        
        # Send transcription to client
        emit('transcription_result', {
            'transcript': transcript,
            'confidence': confidence
        })
        
        # Use streaming AI response for live feel
        full_response = ""
        for ai_chunk in get_ai_response_streaming(session_id, transcript):
            full_response += ai_chunk
            
            # Generate speech and animation for each chunk
            blend_data, audio_filename = generate_speech_and_animation(ai_chunk)
            
            # Send chunk immediately to client
            emit('avatar_speaks_chunk', {
                'blendData': blend_data,
                'filename': audio_filename,
                'text_chunk': ai_chunk
            })
            
            print(f'🗣️ AI chunk: {ai_chunk}')
        
        # Send complete transcript at the end
        emit('avatar_speaks_complete', {
            'transcript': full_response
        })
        
        print(f'✅ Complete AI response: {full_response}')
    
    except Exception as e:
        print(f'Error processing audio stream: {str(e)}')
        emit('error', {'message': str(e)})


@socketio.on('text_message')
def handle_text_message(data):
    """Handle text-based input (fallback for testing without audio)"""
    try:
        session_id = request.sid
        user_text = data.get('text', '')
        
        if not user_text:
            return
        
        print(f'💬 Text message from {session_id}: {user_text}')
        
        # Get AI response
        ai_response = get_ai_response(session_id, user_text)
        
        # Generate speech and animation
        blend_data, audio_filename = generate_speech_and_animation(ai_response)
        
        # Send to client
        emit('avatar_speaks', {
            'blendData': blend_data,
            'filename': audio_filename,
            'transcript': ai_response
        })
        
        print(f'🗣️ AI responds: {ai_response}')
    
    except Exception as e:
        print(f'Error handling text message: {str(e)}')
        emit('error', {'message': str(e)})


# ==================== HTTP Routes ====================

@app.route('/audio/<filename>', methods=['GET'])
def serve_audio(filename):
    """Serve generated audio files"""
    try:
        filepath = os.path.join(AUDIO_DIR, filename)
        return send_file(filepath, mimetype='audio/mpeg')
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'active_sessions': len(chat_sessions)
    })


@app.route('/talk', methods=['POST'])
def talk():
    """Legacy endpoint for backward compatibility"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        blend_data, audio_filename = generate_speech_and_animation(text)
        
        return jsonify({
            'blendData': blend_data,
            'filename': audio_filename
        })
    
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    
    print(f"""
    🚀 AI Interviewer Avatar Server Starting...
    📍 Host: 127.0.0.1
    🔌 Port: {port}
    🤖 AI Model: Gemini 1.5 Flash
    🎤 Speech-to-Text: Enabled
    🔊 Text-to-Speech: Enabled
    """)
    
    # Run with SocketIO
    socketio.run(
        app,
        host='127.0.0.1',
        port=port,
        debug=False,
        use_reloader=False
    )
