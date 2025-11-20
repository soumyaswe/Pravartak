import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    console.log('API: Received request to generate questions');
    const { jobRole } = await request.json();
    console.log('API: Job role requested:', jobRole);

    if (!jobRole || !jobRole.trim()) {
      console.log('API: Job role validation failed - empty or null');
      return NextResponse.json(
        { error: 'Job role is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
      console.error('API: GEMINI_API_KEY is not configured');
      return NextResponse.json(
        { 
          error: 'AI service is not configured. Please set GEMINI_API_KEY in your .env file.',
          hint: 'Get your API key from https://aistudio.google.com/app/apikey'
        },
        { status: 500 }
      );
    }
    
    // Optional: load list of known-leaked keys from an environment variable (avoid hardcoding keys in repo)
    // Set `LEAKED_KEYS_JSON` to a JSON array of leaked keys at deploy time if you need this check.
    const leakedKeys = (() => {
      try {
        return JSON.parse(process.env.LEAKED_KEYS_JSON || '[]');
      } catch (e) {
        return [];
      }
    })();

    if (leakedKeys.length > 0 && leakedKeys.includes(process.env.GEMINI_API_KEY)) {
      console.error('API: Using a leaked API key');
      return NextResponse.json(
        {
          error: '🚨 Your API key has been reported as leaked and blocked by Google. Please generate a new key.',
          hint: 'Provide a list of leaked keys via the LEAKED_KEYS_JSON environment variable.'
        },
        { status: 403 }
      );
    }

    console.log('API: GEMINI_API_KEY is present');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Validate job role first
    const validationPrompt = `
      You are an expert career advisor. The user entered the job role: '${jobRole}'.
      Determine if this is a real, plausible job role that exists in the real world.
      Respond ONLY with a single word: "VALID" if it is real, "INVALID" if it is not.
    `;

    console.log('API: Validating job role:', jobRole);
    const validationResult = await model.generateContent(validationPrompt);
    const validationText = validationResult.response.text().trim().split('\n')[0].toUpperCase();
    console.log('API: Validation result:', validationText);

    if (validationText.includes('INVALID')) {
      console.log('API: Job role validation failed - invalid role');
      return NextResponse.json({
        error: `'${jobRole}' does not seem to be a real-life job role. Please enter a valid one.`,
        isValid: false
      }, { status: 400 });
    }

    // Generate interview questions
    const questionsPrompt = `
      Generate a list of 5 common but insightful interview questions for a '${jobRole}' position in India. 
      Return only the questions as a numbered list.
      Make sure each question is unique and covers different aspects like:
      1. Introduction/Background
      2. Technical skills
      3. Behavioral situations
      4. Problem-solving
      5. Leadership/teamwork
      
      Format as:
      1. [Question]
      2. [Question]
      3. [Question]
      4. [Question]
      5. [Question]
    `;

    console.log('API: Generating questions for:', jobRole);
    const questionsResult = await model.generateContent(questionsPrompt);
    const questionsText = questionsResult.response.text();
    console.log('API: Generated questions text:', questionsText);
    
    // Parse questions from the response
    const questions = questionsText
      .split('\n')
      .filter(line => line.trim() && /^\d+\./.test(line.trim()))
      .map((line, index) => {
        const question = line.replace(/^\d+\.\s*/, '').trim();
        const categories = ['Introduction', 'Technical', 'Behavioral', 'Problem Solving', 'Leadership'];
        const difficulties = ['Easy', 'Medium', 'Medium', 'Hard', 'Hard'];
        const timeLimits = [120, 180, 150, 240, 200];
        
        return {
          id: index + 1,
          category: categories[index] || 'General',
          question: question,
          difficulty: difficulties[index] || 'Medium',
          timeLimit: timeLimits[index] || 180,
        };
      });

    console.log('API: Parsed questions count:', questions.length);
    console.log('API: Parsed questions:', questions);

    if (questions.length === 0) {
      console.error('API: No questions were parsed from the AI response, using fallback');
      // Fallback: provide default questions if AI parsing fails
      const fallbackQuestions = [
        {
          id: 1,
          category: 'Introduction',
          question: `Tell me about yourself and why you're interested in the ${jobRole} position.`,
          difficulty: 'Easy',
          timeLimit: 120,
        },
        {
          id: 2,
          category: 'Technical',
          question: `What are the key skills and technologies required for a ${jobRole}?`,
          difficulty: 'Medium',
          timeLimit: 180,
        },
        {
          id: 3,
          category: 'Behavioral',
          question: 'Describe a challenging situation you faced at work and how you handled it.',
          difficulty: 'Medium',
          timeLimit: 150,
        },
        {
          id: 4,
          category: 'Problem Solving',
          question: `How would you approach a complex problem in your role as a ${jobRole}?`,
          difficulty: 'Hard',
          timeLimit: 240,
        },
        {
          id: 5,
          category: 'Leadership',
          question: 'Tell me about a time when you had to work with a difficult team member.',
          difficulty: 'Hard',
          timeLimit: 200,
        },
      ];
      
      console.log('API: Returning fallback questions');
      return NextResponse.json({
        questions: fallbackQuestions,
        jobRole,
        isValid: true,
        fallback: true
      });
    }

    console.log('API: Successfully returning generated questions');
    return NextResponse.json({
      questions,
      jobRole,
      isValid: true
    });

  } catch (error) {
    console.error('API: Error generating questions:', error);
    console.error('API: Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // More specific error messages
    if (error.message?.includes('API key') || error.message?.includes('403') || error.message?.includes('leaked')) {
      return NextResponse.json(
        { 
          error: '🚨 Your API key has been reported as leaked. Please generate a new Gemini API key.',
          hint: 'Get a new key from https://aistudio.google.com/app/apikey and update your .env file. See SECURITY_INCIDENT.md for details.'
        },
        { status: 403 }
      );
    } else if (error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    } else if (error.message?.includes('network')) {
      return NextResponse.json(
        { error: 'Network error. Please check your internet connection and try again.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: `An error occurred while generating questions: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}