'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Loader, Environment, useFBX, useAnimations, OrthographicCamera } from '@react-three/drei';
import { LineBasicMaterial, Vector2, MeshStandardMaterial, MeshPhysicalMaterial } from 'three';
import ReactAudioPlayer from 'react-audio-player';
import { io } from 'socket.io-client';
import createAnimation from './converter';
import blinkData from './blendDataBlink.json';
import * as THREE from 'three';
import { SRGBColorSpace, LinearSRGBColorSpace } from 'three';

const _ = require('lodash');

const host = 'http://127.0.0.1:5000'

// Initialize Socket.IO connection
let socket = null;

function Avatar({ avatar_url, speak, setSpeak, text, setAudioSource, playing, blendData: externalBlendData }) {

  let gltf = useGLTF(avatar_url);
  let morphTargetDictionaryBody = null;
  let morphTargetDictionaryLowerTeeth = null;

  const [ 
    bodyTexture, 
    eyesTexture, 
    teethTexture, 
    bodySpecularTexture, 
    bodyRoughnessTexture, 
    bodyNormalTexture,
    teethNormalTexture,
    hairTexture,
    tshirtDiffuseTexture,
    tshirtNormalTexture,
    tshirtRoughnessTexture,
    hairAlphaTexture,
    hairNormalTexture,
    hairRoughnessTexture,
  ] = useTexture([
    "/images/body.webp",
    "/images/eyes.webp",
    "/images/teeth_diffuse.webp",
    "/images/body_specular.webp",
    "/images/body_roughness.webp",
    "/images/body_normal.webp",
    "/images/teeth_normal.webp",
    "/images/h_color.webp",
    "/images/tshirt_diffuse.webp",
    "/images/tshirt_normal.webp",
    "/images/tshirt_roughness.webp",
    "/images/h_alpha.webp",
    "/images/h_normal.webp",
    "/images/h_roughness.webp",
  ]);

  _.each([
    bodyTexture, 
    eyesTexture, 
    teethTexture, 
    teethNormalTexture, 
    bodySpecularTexture, 
    bodyRoughnessTexture, 
    bodyNormalTexture, 
    tshirtDiffuseTexture, 
    tshirtNormalTexture, 
    tshirtRoughnessTexture,
    hairAlphaTexture,
    hairNormalTexture,
    hairRoughnessTexture
  ], t => {
    t.colorSpace = SRGBColorSpace;
    t.flipY = false;
  });

  bodyNormalTexture.colorSpace = LinearSRGBColorSpace;
  tshirtNormalTexture.colorSpace = LinearSRGBColorSpace;
  teethNormalTexture.colorSpace = LinearSRGBColorSpace;
  hairNormalTexture.colorSpace = LinearSRGBColorSpace;

  gltf.scene.traverse(node => {
    if(node.type === 'Mesh' || node.type === 'LineSegments' || node.type === 'SkinnedMesh') {
      node.castShadow = true;
      node.receiveShadow = true;
      node.frustumCulled = false;
    
      if (node.name.includes("Body")) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.material = new MeshPhysicalMaterial();
        node.material.map = bodyTexture;
        node.material.roughness = 1.7;
        node.material.roughnessMap = bodyRoughnessTexture;
        node.material.normalMap = bodyNormalTexture;
        node.material.normalScale = new Vector2(0.6, 0.6);
        morphTargetDictionaryBody = node.morphTargetDictionary;
        node.material.envMapIntensity = 0.8;
      }

      if (node.name.includes("Eyes")) {
        node.material = new MeshStandardMaterial();
        node.material.map = eyesTexture;
        node.material.roughness = 0.1;
        node.material.envMapIntensity = 0.5;
      }

      if (node.name.includes("Brows")) {
        node.material = new LineBasicMaterial({color: 0x000000});
        node.material.linewidth = 1;
        node.material.opacity = 0.5;
        node.material.transparent = true;
        node.visible = false;
      }

      if (node.name.includes("Teeth")) {
        node.receiveShadow = true;
        node.castShadow = true;
        node.material = new MeshStandardMaterial();
        node.material.roughness = 0.1;
        node.material.map = teethTexture;
        node.material.normalMap = teethNormalTexture;
        node.material.envMapIntensity = 0.7;
      }

      if (node.name.includes("Hair")) {
        node.material = new MeshStandardMaterial();
        node.material.map = hairTexture;
        node.material.alphaMap = hairAlphaTexture;
        node.material.normalMap = hairNormalTexture;
        node.material.roughnessMap = hairRoughnessTexture;
        node.material.transparent = true;
        node.material.depthWrite = false;
        node.material.side = 2;
        node.material.color.setHex(0x000000);
        node.material.envMapIntensity = 0.3;
      }

      if (node.name.includes("TSHIRT")) {
        node.material = new MeshStandardMaterial();
        node.material.map = tshirtDiffuseTexture;
        node.material.roughnessMap = tshirtRoughnessTexture;
        node.material.normalMap = tshirtNormalTexture;
        node.material.color.setHex(0xffffff);
        node.material.envMapIntensity = 0.5;
      }

      if (node.name.includes("TeethLower")) {
        morphTargetDictionaryLowerTeeth = node.morphTargetDictionary;
      }
    }
  });

  const [clips, setClips] = useState([]);
  const mixer = new THREE.AnimationMixer(gltf.scene);

  // Handle external blend data from WebSocket
  useEffect(() => {
    if (!externalBlendData || !morphTargetDictionaryBody || !morphTargetDictionaryLowerTeeth) {
      return;
    }

    console.log('🎭 Creating animation from WebSocket blend data');

    let newClips = [ 
      createAnimation(externalBlendData, morphTargetDictionaryBody, 'HG_Body'), 
      createAnimation(externalBlendData, morphTargetDictionaryLowerTeeth, 'HG_TeethLower')
    ];

    setClips(newClips);

  }, [externalBlendData, morphTargetDictionaryBody, morphTargetDictionaryLowerTeeth]);

  // Load idle animation
  let idleFbx = useFBX('/idle.fbx');
  let { clips: idleClips } = useAnimations(idleFbx.animations);

  idleClips[0].tracks = _.filter(idleClips[0].tracks, track => {
    return track.name.includes("Head") || track.name.includes("Neck") || track.name.includes("Spine2");
  });

  idleClips[0].tracks = _.map(idleClips[0].tracks, track => {
    if (track.name.includes("Head")) {
      track.name = "head.quaternion";
    }
    if (track.name.includes("Neck")) {
      track.name = "neck.quaternion";
    }
    if (track.name.includes("Spine")) {
      track.name = "spine2.quaternion";
    }
    return track;
  });

  useEffect(() => {
    let idleClipAction = mixer.clipAction(idleClips[0]);
    idleClipAction.play();

    let blinkClip = createAnimation(blinkData, morphTargetDictionaryBody, 'HG_Body');
    let blinkAction = mixer.clipAction(blinkClip);
    blinkAction.play();
  }, []);

  // Play animation clips when available
  useEffect(() => {
    if (playing === false) return;
    
    _.each(clips, clip => {
      let clipAction = mixer.clipAction(clip);
      clipAction.setLoop(THREE.LoopOnce);
      clipAction.play();
    });

  }, [playing, clips]);

  useFrame((state, delta) => {
    mixer.update(delta);
  });

  return (
    <group name="avatar">
      <primitive object={gltf.scene} dispose={null} />
    </group>
  );
}

const STYLES = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden'
  },
  videoContainer: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  video: {
    width: '240px',
    height: '180px',
    border: '3px solid #00ff88',
    borderRadius: '12px',
    objectFit: 'cover',
    boxShadow: '0 4px 20px rgba(0, 255, 136, 0.3)'
  },
  controlPanel: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    zIndex: 100,
    background: 'rgba(0, 0, 0, 0.8)',
    padding: '20px',
    borderRadius: '12px',
    minWidth: '320px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  status: {
    color: '#00ff88',
    fontSize: '0.9em',
    marginBottom: '15px',
    padding: '8px 12px',
    background: 'rgba(0, 255, 136, 0.1)',
    borderRadius: '6px',
    border: '1px solid rgba(0, 255, 136, 0.3)'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  },
  button: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #00ff88, #00cc70)',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.95em',
    transition: 'all 0.3s ease',
    flex: 1
  },
  buttonDisabled: {
    padding: '12px 24px',
    background: '#444',
    color: '#888',
    border: 'none',
    borderRadius: '8px',
    cursor: 'not-allowed',
    fontWeight: 'bold',
    fontSize: '0.95em',
    flex: 1
  },
  buttonRecording: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #ff4444, #cc0000)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.95em',
    animation: 'pulse 1.5s infinite',
    flex: 1
  },
  transcript: {
    marginTop: '15px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxHeight: '120px',
    overflowY: 'auto'
  },
  transcriptLabel: {
    color: '#00ff88',
    fontSize: '0.8em',
    marginBottom: '8px',
    fontWeight: 'bold'
  },
  transcriptText: {
    color: '#fff',
    fontSize: '0.9em',
    lineHeight: '1.5'
  },
  header: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 100,
    color: '#fff'
  },
  title: {
    fontSize: '1.5em',
    fontWeight: 'bold',
    margin: 0,
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
  },
  subtitle: {
    fontSize: '0.9em',
    color: '#00ff88',
    margin: '5px 0 0 0'
  }
};

function AppInterviewer() {
  const audioPlayer = useRef();
  const videoRef = useRef();
  const mediaRecorderRef = useRef();
  const audioChunksRef = useRef([]);

  const [connected, setConnected] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioSource, setAudioSource] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [blendData, setBlendData] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [userTranscript, setUserTranscript] = useState('');
  const [aiTranscript, setAiTranscript] = useState('');
  const [mediaStream, setMediaStream] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    socket = io(host, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('✅ Connected to server');
      setConnected(true);
      setStatusMessage('Connected - Ready to start');
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setConnected(false);
      setStatusMessage('Disconnected from server');
    });

    socket.on('connection_response', (data) => {
      console.log('🔗 Connection response:', data);
    });

    socket.on('avatar_speaks', (data) => {
      console.log('🗣️ Avatar speaking:', data);
      setBlendData(data.blendData);
      setAudioSource(host + data.filename);
      setAiTranscript(data.transcript || '');
      setStatusMessage('AI Interviewer is speaking...');
    });

    // Handle streaming chunks from AI
    socket.on('avatar_speaks_chunk', (data) => {
      console.log('🗣️ Avatar chunk:', data.text_chunk);
      
      // Append to current blend data for continuous animation
      if (data.blendData) {
        setBlendData(prevData => {
          if (!prevData) return data.blendData;
          // Merge animations for smooth streaming
          return [...prevData, ...data.blendData];
        });
      }
      
      // Queue audio for playback
      if (data.filename) {
        setAudioSource(host + data.filename);
      }
      
      // Append text chunk to transcript
      setAiTranscript(prev => prev + data.text_chunk);
      setStatusMessage('AI is streaming response...');
    });

    // Handle complete response
    socket.on('avatar_speaks_complete', (data) => {
      console.log('✅ AI complete:', data.transcript);
      setAiTranscript(data.transcript);
      setStatusMessage('Your turn to speak');
    });

    socket.on('transcription_result', (data) => {
      console.log('📝 Transcription:', data);
      setUserTranscript(data.transcript);
      setStatusMessage(`You said: "${data.transcript}"`);
    });

    socket.on('error', (data) => {
      console.error('❌ Error:', data);
      setStatusMessage(`Error: ${data.message}`);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Setup media devices
  useEffect(() => {
    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000
          }
        });

        setMediaStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setStatusMessage('Camera and microphone ready');
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setStatusMessage('Error: Could not access camera/microphone');
      }
    }

    setupMedia();
  }, []);

  // Start interview
  const handleStartInterview = () => {
    if (!connected) return;

    console.log('🎬 Starting interview...');
    socket.emit('start_interview');
    setInterviewStarted(true);
    setStatusMessage('Interview started - Waiting for AI...');
  };

  // Start recording user response
  const handleStartRecording = () => {
    if (!mediaStream || !connected) return;

    try {
      audioChunksRef.current = [];

      // Create MediaRecorder with audio only
      const audioStream = new MediaStream(mediaStream.getAudioTracks());
      const mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to base64 and send
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result.split(',')[1];
          socket.emit('audio_stream_end', { audio: base64Audio });
          setStatusMessage('Processing your response...');
        };
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setStatusMessage('🎤 Recording your answer...');

    } catch (err) {
      console.error('Error starting recording:', err);
      setStatusMessage('Error starting recording');
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatusMessage('Processing your answer...');
    }
  };

  // Audio player callbacks
  function playerEnded(e) {
    console.log('🎵 Audio ended');
    setAudioSource(null);
    setPlaying(false);
    setStatusMessage('Your turn to speak');
  }

  function playerReady(e) {
    console.log('🎧 Audio ready');
    if (audioPlayer.current) {
      audioPlayer.current.audioEl.current.play();
      setPlaying(true);
    }
  }

  return (
    <div style={STYLES.container}>
      {/* Header */}
      <div style={STYLES.header}>
        <h1 style={STYLES.title}>🤖 AI Interviewer</h1>
        <p style={STYLES.subtitle}>Powered by Google Cloud AI</p>
      </div>

      {/* User Video Feed */}
      <div style={STYLES.videoContainer}>
        <video 
          ref={videoRef}
          autoPlay 
          muted
          playsInline
          style={STYLES.video}
        />
      </div>

      {/* Control Panel */}
      <div style={STYLES.controlPanel}>
        <div style={STYLES.status}>
          {statusMessage}
        </div>

        <div style={STYLES.buttonGroup}>
          {!interviewStarted ? (
            <button 
              onClick={handleStartInterview}
              style={connected ? STYLES.button : STYLES.buttonDisabled}
              disabled={!connected}
            >
              🎬 Start Interview
            </button>
          ) : (
            <>
              <button 
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                style={isRecording ? STYLES.buttonRecording : STYLES.button}
                disabled={!connected || playing}
              >
                {isRecording ? '⏹️ Stop' : '🎤 Respond'}
              </button>
            </>
          )}
        </div>

        {/* Transcripts */}
        {aiTranscript && (
          <div style={STYLES.transcript}>
            <div style={STYLES.transcriptLabel}>AI Interviewer:</div>
            <div style={STYLES.transcriptText}>{aiTranscript}</div>
          </div>
        )}

        {userTranscript && (
          <div style={STYLES.transcript}>
            <div style={STYLES.transcriptLabel}>You said:</div>
            <div style={STYLES.transcriptText}>{userTranscript}</div>
          </div>
        )}
      </div>

      {/* Audio Player */}
      <ReactAudioPlayer
        src={audioSource}
        ref={audioPlayer}
        onEnded={playerEnded}
        onCanPlayThrough={playerReady}
      />

      {/* 3D Avatar Canvas */}
      <Canvas dpr={2} onCreated={(ctx) => {
        ctx.gl.physicallyCorrectLights = true;
      }}>
        <OrthographicCamera 
          makeDefault
          zoom={2000}
          position={[0, 1.65, 1]}
        />

        <Suspense fallback={null}>
          <Environment background={false} files="/images/photo_studio_loft_hall_1k.hdr" />
        </Suspense>

        <Suspense fallback={null}>
          <Bg />
        </Suspense>

        <Suspense fallback={null}>
          <Avatar 
            avatar_url="/model.glb" 
            speak={playing} 
            setSpeak={setPlaying}
            text={''}
            setAudioSource={setAudioSource}
            playing={playing}
            blendData={blendData}
          />
        </Suspense>
      </Canvas>

      <Loader dataInterpolation={(p) => `Loading AI Interviewer... ${Math.round(p)}%`} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
      `}</style>
    </div>
  );
}

function Bg() {
  const texture = useTexture('/images/bg.webp');

  return (
    <mesh position={[0, 1.5, -2]} scale={[0.8, 0.8, 0.8]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

export default AppInterviewer;
