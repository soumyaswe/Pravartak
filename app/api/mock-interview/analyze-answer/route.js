import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback models in priority order
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash'
];

// Helper function to retry with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastRetry = i === maxRetries - 1;
      const is503 = error.message?.includes('503') || error.message?.includes('overloaded');
      const is429 = error.message?.includes('429') || error.message?.includes('quota');
      
      if (!is503 && !is429) throw error;
      if (isLastRetry) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Helper function to try multiple models
async function generateWithFallback(prompt, models = MODELS) {
  let lastError = null;
  
  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await retryWithBackoff(async () => {
        return await model.generateContent(prompt);
      });
      console.log(`Success with ${modelName}`);
      return result;
    } catch (error) {
      console.log(`Model ${modelName} failed:`, error.message);
      lastError = error;
    }
  }
  throw lastError || new Error('All models failed');
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const question = formData.get('question');
    const jobRole = formData.get('jobRole');
    let transcript = formData.get('transcript');

    console.log('Analyzing answer for:', { jobRole, hasAudio: !!audioFile, hasTranscript: !!transcript });

    if (!audioFile || !question || !jobRole) {
      return NextResponse.json(
        { error: 'Audio file, question, and job role are required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Model will be selected by generateWithFallback helper

    // Use Google Cloud Speech-to-Text API for transcription
    let speechAnalysis = null;
    
    try {
      console.log('Calling Google Cloud Speech-to-Text API...');
      const transcribeFormData = new FormData();
      transcribeFormData.append('audio', audioFile);
      
      const transcribeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mock-interview/transcribe`, {
        method: 'POST',
        body: transcribeFormData,
      });

      if (transcribeResponse.ok) {
        const transcriptionData = await transcribeResponse.json();
        console.log('Google Cloud Speech API response:', transcriptionData);
        
        transcript = transcriptionData.transcript || transcript;
        speechAnalysis = {
          transcript: transcriptionData.transcript,
          confidence: transcriptionData.confidence,
          wpm: transcriptionData.metrics?.wpm || 0,
          pauseCount: transcriptionData.metrics?.pauseCount || 0,
          fillerCount: transcriptionData.metrics?.fillerCount || 0,
          duration: transcriptionData.metrics?.duration || 0,
          wordCount: transcriptionData.metrics?.wordCount || 0
        };
      } else {
        console.warn('Google Cloud Speech API failed, using fallback');
        speechAnalysis = analyzeAudioFallback(audioFile, transcript);
      }
    } catch (error) {
      console.error('Error calling transcription API:', error);
      speechAnalysis = analyzeAudioFallback(audioFile, transcript);
    }
    
    console.log('Speech analysis:', speechAnalysis);

    // Evaluate answer content using Gemini
    const contentPrompt = `
      You are a senior hiring manager for a '${jobRole}' position in India. Your task is to evaluate a candidate's answer to an interview question.
      
      The question asked was:
      "${question}"

      The candidate's transcribed answer is:
      "${speechAnalysis.transcript || transcript || 'No transcript available - analysis based on audio characteristics'}"

      Speech Analysis Metrics:
      - Words per minute: ${speechAnalysis.wpm}
      - Pause count: ${speechAnalysis.pauseCount}
      - Filler word count: ${speechAnalysis.fillerCount}
      - Confidence score: ${(speechAnalysis.confidence * 100).toFixed(1)}%

      Please provide your evaluation in a strict JSON format with two keys:
      1. "score": An integer from 1 to 5, where 1 is poor and 5 is excellent.
      2. "justification": A concise, one-sentence explanation for your score, providing constructive feedback.

      Consider factors like:
      - Relevance to the question
      - Use of specific examples
      - Structure and clarity
      - Completeness of the answer
      - Professional language
      - Speech delivery (pacing, pauses, filler words)

      If no transcript is available, focus on encouraging the candidate and provide a neutral score.

      Example Response:
      {
        "score": 4,
        "justification": "The candidate provided a solid example using the STAR method, but could have elaborated more on the final outcome."
      }

      JSON Response:
    `;

    console.log('Sending content evaluation request to Gemini');
    const contentResult = await generateWithFallback(contentPrompt);
    let contentEvaluation;
    
    try {
      const responseText = contentResult.response.text().trim();
      console.log('Gemini response:', responseText);
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      contentEvaluation = JSON.parse(jsonText);
      console.log('Parsed content evaluation:', contentEvaluation);
    } catch (parseError) {
      console.error('Error parsing content evaluation:', parseError);
      contentEvaluation = {
        score: 3,
        justification: "Your response was recorded successfully. Due to technical limitations, detailed content analysis is unavailable at the moment."
      };
    }

    // Combine speech analysis and content evaluation
    const fullReport = {
      ...speechAnalysis,
      ...contentEvaluation,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(fullReport);

  } catch (error) {
    console.error('Error analyzing answer:', error);
    return NextResponse.json(
      { error: 'An error occurred while analyzing your answer. Please try again.' },
      { status: 500 }
    );
  }
}

// Fallback analysis when Google Cloud Speech API is unavailable
function analyzeAudioFallback(audioFile, transcript) {
  console.warn('Using fallback speech analysis');
  const audioSize = audioFile.size;
  const estimatedDuration = Math.max(10, Math.min(300, audioSize / 10000)); // Rough estimation
  
  // Estimate based on transcript or audio size
  const wordCount = transcript ? transcript.split(' ').length : Math.floor(audioSize / 1000);
  const wpm = Math.round((wordCount / estimatedDuration) * 60);
  
  // Detect filler words if transcript is available
  const fillerWords = ['um', 'uh', 'like', 'so', 'you know', 'actually', 'basically'];
  const fillerCount = transcript 
    ? fillerWords.reduce((count, filler) => 
        count + (transcript.toLowerCase().split(filler).length - 1), 0)
    : Math.floor(Math.random() * 5);
  
  // Estimate pause count
  const pauseCount = Math.floor(estimatedDuration / 10) + Math.floor(Math.random() * 3);
  
  // Estimate confidence score
  const confidence = transcript ? 0.75 : 0.5;
  
  return {
    transcript: transcript || `[Fallback: Transcript unavailable for ${Math.floor(estimatedDuration)}s audio]`,
    wpm: Math.max(60, Math.min(200, wpm)),
    pauseCount,
    fillerCount,
    confidence,
    duration: estimatedDuration,
    wordCount
  };
}