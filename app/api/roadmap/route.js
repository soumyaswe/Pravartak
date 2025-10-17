import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const FICTIONAL_CAREERS_BLOCKLIST = [
  'jedi', 'wizard', 'dragon rider', 'superhero', 'hobbit', 'elf',
  'vampire hunter', 'time lord', 'starfleet'
];

function generateCareerSpecificFallback(career) {
  const careerLower = career.toLowerCase();
  
  // Career-specific roadmaps based on common career paths
  if (careerLower.includes('developer') || careerLower.includes('engineer') || careerLower.includes('programmer')) {
    return {
      career: career,
      roadmap: [
        {
          title: "Programming Fundamentals",
          steps: [
            "Master core programming concepts and syntax",
            "Learn data structures and algorithms",
            "Practice problem-solving with coding challenges",
            "Understand version control with Git",
            "Build your first simple applications"
          ]
        },
        {
          title: "Technical Skill Building",
          steps: [
            "Learn relevant frameworks and libraries",
            "Master database design and management",
            "Understand software architecture patterns",
            "Practice with real-world projects",
            "Learn testing and debugging techniques"
          ]
        },
        {
          title: "Professional Development",
          steps: [
            "Build a portfolio of projects",
            "Contribute to open-source projects",
            "Network with other developers",
            "Apply for internships or entry-level positions",
            "Continuously learn new technologies"
          ]
        }
      ]
    };
  } else if (careerLower.includes('data') || careerLower.includes('scientist') || careerLower.includes('analyst')) {
    return {
      career: career,
      roadmap: [
        {
          title: "Data Foundation",
          steps: [
            "Learn statistics and probability",
            "Master Python or R programming",
            "Understand data manipulation with pandas/dplyr",
            "Learn SQL for database querying",
            "Practice data visualization techniques"
          ]
        },
        {
          title: "Advanced Analytics",
          steps: [
            "Study machine learning algorithms",
            "Learn deep learning frameworks",
            "Master data preprocessing techniques",
            "Understand model evaluation and validation",
            "Practice with real datasets"
          ]
        },
        {
          title: "Industry Application",
          steps: [
            "Work on end-to-end data projects",
            "Learn cloud platforms (AWS, GCP, Azure)",
            "Understand MLOps and model deployment",
            "Build a data science portfolio",
            "Network with data professionals"
          ]
        }
      ]
    };
  } else if (careerLower.includes('design') || careerLower.includes('ui') || careerLower.includes('ux')) {
    return {
      career: career,
      roadmap: [
        {
          title: "Design Fundamentals",
          steps: [
            "Learn design principles and color theory",
            "Master design tools (Figma, Adobe Creative Suite)",
            "Understand typography and layout",
            "Study user psychology and behavior",
            "Practice with design exercises"
          ]
        },
        {
          title: "User Experience Focus",
          steps: [
            "Learn user research methodologies",
            "Master wireframing and prototyping",
            "Understand usability testing",
            "Study accessibility guidelines",
            "Practice information architecture"
          ]
        },
        {
          title: "Professional Portfolio",
          steps: [
            "Build a strong design portfolio",
            "Work on real client projects",
            "Network with design professionals",
            "Stay updated with design trends",
            "Apply for design positions"
          ]
        }
      ]
    };
  } else {
    // Generic fallback for any other career
    return {
      career: career,
      roadmap: [
        {
          title: "Foundation Building",
          steps: [
            `Learn the fundamentals of ${career}`,
            "Complete relevant educational courses",
            "Practice basic skills through projects",
            "Build foundational knowledge",
            "Network with professionals in the field"
          ]
        },
        {
          title: "Skill Development",
          steps: [
            `Develop core ${career} competencies`,
            "Work on practical, real-world projects",
            "Build a professional portfolio",
            "Gain hands-on experience",
            "Seek mentorship opportunities"
          ]
        },
        {
          title: "Career Advancement",
          steps: [
            "Gain industry experience",
            "Build professional network",
            "Pursue advanced certifications",
            "Take on leadership roles",
            "Continuously update skills"
          ]
        }
      ]
    };
  }
}

const SYSTEM_PROMPT = `
You are an expert career counselor. Your task is to generate a structured career roadmap for a given profession.
You MUST provide the output as a clean JSON object, without any surrounding text or markdown.
The JSON structure should be an array of stages in a "roadmap" key. The number of stages should be whatever is appropriate for the career.

Here is an example of the required structure:
{
  "career": "The Career Title",
  "roadmap": [
    {
      "title": "Stage 1 Title",
      "steps": [
        "Step 1.1 description",
        "Step 1.2 description"
      ]
    },
    {
      "title": "Stage 2 Title",
      "steps": [
        "Step 2.1 description",
        "Step 2.2 description",
        "Step 2.3 description"
      ]
    }
  ]
}
Ensure the roadmap is logical, comprehensive, and covers key skills, technologies, and milestones.
Do not generate roadmaps for fictional careers.
`;

export async function POST(request) {
  let career = '';
  
  try {
    console.log('Roadmap API called');
    
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed:', body);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    career = body.career;
    console.log('Career requested:', career);

    if (!career || typeof career !== 'string') {
      console.error('Invalid career input:', career);
      return NextResponse.json(
        { error: 'Career input is required and must be a string' },
        { status: 400 }
      );
    }

    // Check for fictional careers
    const userInputLower = career.toLowerCase();
    const isFictional = FICTIONAL_CAREERS_BLOCKLIST.some(keyword => 
      new RegExp(`\\b${keyword}\\b`).test(userInputLower)
    );

    if (isFictional) {
      return NextResponse.json(
        { error: 'I can only generate roadmaps for real-world careers. Please enter a valid profession.' },
        { status: 400 }
      );
    }

    // Initialize Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      console.error('Gemini API key not configured, using fallback response');
      // Return career-specific fallback response instead of generic one
      return NextResponse.json({
        success: true,
        data: generateCareerSpecificFallback(career)
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const fullPrompt = `${SYSTEM_PROMPT}\n\nPlease generate a roadmap for the career: '${career}'`;
    
    console.log('Sending request to Gemini AI...');
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    console.log('Received response from Gemini AI');

    // Clean the response
    const cleanedResponse = text.trim();
    const jsonText = cleanedResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    console.log('Cleaned JSON text:', jsonText.substring(0, 200) + '...');

    let roadmapData;
    try {
      roadmapData = JSON.parse(jsonText);
      console.log('JSON parsed successfully');
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', text);
      return NextResponse.json(
        { error: 'AI response was not in valid JSON format. Please try again.' },
        { status: 500 }
      );
    }

    // Validate the structure
    if (!roadmapData.roadmap || !Array.isArray(roadmapData.roadmap)) {
      console.error('Invalid roadmap structure:', roadmapData);
      return NextResponse.json(
        { error: 'Invalid roadmap structure received from AI' },
        { status: 500 }
      );
    }

    console.log('Roadmap generated successfully for:', career);
    return NextResponse.json({ success: true, data: roadmapData });

  } catch (error) {
    console.error('Roadmap generation error:', error);
    
    // Fallback for quota exceeded or other API errors
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return NextResponse.json({
        success: true,
        data: generateCareerSpecificFallback(career)
      });
    }

    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}