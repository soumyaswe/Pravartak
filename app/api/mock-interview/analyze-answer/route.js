import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const question = formData.get('question');
    const jobRole = formData.get('jobRole');
    const transcript = formData.get('transcript'); // In real implementation, you'd use speech-to-text

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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // For now, we'll simulate speech analysis since we don't have Google Cloud Speech API
    // In a real implementation, you would:
    // 1. Convert audio to text using Speech-to-Text API
    // 2. Analyze speech patterns (WPM, pauses, filler words)
    
    // Simulated speech analysis (replace with actual implementation)
    const simulatedAnalysis = analyzeAudioSimulation(audioFile, transcript);
    console.log('Simulated analysis:', simulatedAnalysis);

    // Evaluate answer content using Gemini
    const contentPrompt = `
      You are a senior hiring manager for a '${jobRole}' position in India. Your task is to evaluate a candidate's answer to an interview question.
      
      The question asked was:
      "${question}"

      The candidate's transcribed answer is:
      "${transcript || 'No transcript available - analysis based on audio characteristics'}"

      Please provide your evaluation in a strict JSON format with two keys:
      1. "score": An integer from 1 to 5, where 1 is poor and 5 is excellent.
      2. "justification": A concise, one-sentence explanation for your score, providing constructive feedback.

      Consider factors like:
      - Relevance to the question
      - Use of specific examples
      - Structure and clarity
      - Completeness of the answer
      - Professional language

      If no transcript is available, focus on encouraging the candidate and provide a neutral score.

      Example Response:
      {
        "score": 4,
        "justification": "The candidate provided a solid example using the STAR method, but could have elaborated more on the final outcome."
      }

      JSON Response:
    `;

    console.log('Sending content evaluation request to Gemini');
    const contentResult = await model.generateContent(contentPrompt);
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
      ...simulatedAnalysis,
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

// Simulated speech analysis function
function analyzeAudioSimulation(audioFile, transcript) {
  // This is a simulation - in real implementation, you'd use Google Cloud Speech API
  const audioSize = audioFile.size;
  const estimatedDuration = Math.max(10, Math.min(300, audioSize / 10000)); // Rough estimation
  
  // Simulate analysis based on transcript or audio size
  const wordCount = transcript ? transcript.split(' ').length : Math.floor(audioSize / 1000);
  const wpm = Math.round((wordCount / estimatedDuration) * 60);
  
  // Simulate filler words detection
  const fillerWords = ['um', 'uh', 'like', 'so', 'you know', 'actually', 'basically'];
  const fillerCount = transcript 
    ? fillerWords.reduce((count, filler) => 
        count + (transcript.toLowerCase().split(filler).length - 1), 0)
    : Math.floor(Math.random() * 5);
  
  // Simulate pause detection
  const pauseCount = Math.floor(estimatedDuration / 10) + Math.floor(Math.random() * 3);
  
  // Simulate confidence score
  const confidence = 0.8 + (Math.random() * 0.2); // 80-100%
  
  return {
    transcript: transcript || `[Simulated transcript for ${Math.floor(estimatedDuration)}s audio]`,
    wpm: Math.max(60, Math.min(200, wpm)),
    pauseCount,
    fillerCount,
    confidence,
    duration: estimatedDuration
  };
}