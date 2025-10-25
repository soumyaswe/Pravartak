import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import { marked } from "marked";

// --- CV ANALYZER API (CONVERTED FROM PYTHON) ---
// This API endpoint provides CV/Resume analysis using Google's Gemini AI
// Required environment variable: GEMINI_API_KEY
// 
// Features implemented from Python version:
// 1. Fictional job title blocklist
// 2. Structured analysis (Current Assessment, Suggestions, Skill Gap)
// 3. PDF, DOCX, and image support
// 4. Professional scoring system

// --- FICTIONAL JOBS BLOCKLIST (EXACT FROM PYTHON) ---
const FICTIONAL_JOBS_BLOCKLIST = [
  'jedi', 'wizard', 'dragon rider', 'superhero', 'hobbit', 'elf', 'vampire hunter', 
  'time lord', 'starfleet', 'hogwarts professor', 'quidditch player', 'stormtrooper',
  'king', 'queen', 'emperor', 'mythical creature'
];

// --- SYSTEM PROMPT (EXACT FROM PYTHON) ---
const SYSTEM_PROMPT = `
You are an expert career coach and professional resume analyzer.
You will be given the contents of a resume (either as text extracted from a PDF or an image) and a target job title.
Your task is to provide a detailed analysis of the resume for that specific job title.

# --- ADDED RULE ---
If the target job title is clearly fictional, nonsensical, or not a real-world profession (e.g., 'Wizard of Oz', 'Superhero Sidekick'), you MUST politely refuse the analysis and state that you can only analyze resumes for real-world jobs.

Your analysis for valid jobs MUST be structured into the following three sections, using Markdown for formatting:

## 1. Current Assessment
Provide an honest evaluation of the resume's current effectiveness for the target role.
- Mention its strengths (e.g., clear layout, strong action verbs).
- Mention its weaknesses (e.g., missing quantifiable results, generic summary).
- Conclude with a score from 1 to 10, where 1 is poor and 10 is excellent.

## 2. Suggestions for Improvement
Provide a list of concrete, actionable suggestions to improve the resume.
- Be specific. For example, instead of "Improve bullet points," suggest "Rephrase bullet points to start with strong action verbs and include a quantifiable result, like 'Increased user engagement by 15%'."
- Suggest missing sections if applicable (e.g., Professional Summary, Technical Skills).

## 3. Skill Gap & Potential Analysis
Identify key skills or qualifications that are critical for the target job title but are missing from the resume.
- List the missing skills (e.g., Python, Project Management, SEO, AWS certification).
- Explain how adding these skills would improve the resume's quality.
- Provide a "Potential Score" out of 10 that the user could achieve if they incorporated both the improvements and the missing skills.

IMPORTANT: You must not do anything other than this analysis. Do not offer to rewrite the resume, do not write a cover letter, and do not engage in any conversation beyond providing these three sections of analysis.
`;

// Function to convert Markdown to HTML
function formatAnalysisOutput(rawAnalysis) {
  try {
    // Configure marked options for better rendering
    marked.setOptions({
      breaks: true, // Convert line breaks to <br>
      gfm: true, // Enable GitHub Flavored Markdown
      headerIds: false, // Disable header IDs for cleaner output
      mangle: false // Don't mangle autolinks
    });
    
    // Convert Markdown to HTML
    const htmlOutput = marked.parse(rawAnalysis);
    
    return htmlOutput;
  } catch (error) {
    console.error("Error parsing Markdown:", error);
    // Fallback to original text if parsing fails
    return rawAnalysis;
  }
}

// Initialize Gemini AI
let genAI;
let model;

try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  console.log("Gemini API configured successfully for CV analysis.");
} catch (error) {
  console.error("Error configuring Gemini API for CV analysis:", error);
}

export async function POST(request) {
  try {
    // Check if API is configured
    if (!model) {
      return NextResponse.json(
        { 
          error: "Gemini API is not configured. Please check your setup.", 
          success: false 
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const jobTitle = formData.get("jobTitle");

    // Validation (exact from Python logic)
    if (!jobTitle || typeof jobTitle !== 'string' || !jobTitle.trim()) {
      return NextResponse.json(
        { 
          error: "Please enter a target job title.", 
          success: false 
        },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { 
          error: "Please upload a CV/Resume file.", 
          success: false 
        },
        { status: 400 }
      );
    }

    const userInputLower = jobTitle.toLowerCase();

    // --- FAST-FAIL GUARDRAIL CHECK (EXACT FROM PYTHON) ---
    const hasBlockedWord = FICTIONAL_JOBS_BLOCKLIST.some(keyword => {
      // Using word boundary regex like in Python
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(userInputLower);
    });

    if (hasBlockedWord) {
      return NextResponse.json(
        { 
          error: "Please enter a real-world job title. Fictional or irrelevant jobs cannot be analyzed.", 
          success: false 
        },
        { status: 400 }
      );
    }

    // Validate file type (supporting PDF, DOCX, and images like Python version)
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "image/png", 
      "image/jpeg", 
      "image/jpg",
      "image/webp",
      "text/plain"
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: `Unsupported file type '${file.type}'. Please upload a PDF, DOCX, or an image (PNG, JPG, WEBP).`, 
          success: false 
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: "File size too large. Please upload files smaller than 5MB.", 
          success: false 
        },
        { status: 400 }
      );
    }

    try {
      console.log(`Analyzing file: ${file.name} for job: ${jobTitle}`);
      
      // Prepare prompt parts (exact structure from Python)
      const promptParts = [
        SYSTEM_PROMPT, 
        `\nHere is the analysis request:\n**Target Job Title:** ${jobTitle}\n\n**Resume Content:**\n`
      ];

      // Handle different file types like Python version
      if (file.type === "application/pdf") {
        // Handle PDF files using pdf-parse with dynamic import
        try {
          const pdfParse = (await import("pdf-parse")).default;
          const bytes = await file.arrayBuffer();
          const pdfData = await pdfParse(Buffer.from(bytes));
          const fileContent = pdfData.text;
          
          if (!fileContent.trim()) {
            return NextResponse.json(
              { 
                error: "Could not extract any text from the PDF file. The file might be empty, corrupted, or image-only.", 
                success: false 
              },
              { status: 400 }
            );
          }
          promptParts.push(fileContent);
        } catch (pdfError) {
          console.error("Error processing PDF file:", pdfError);
          return NextResponse.json(
            { 
              error: "Failed to process the PDF file. Please ensure it's a valid PDF document with extractable text.", 
              success: false 
            },
            { status: 400 }
          );
        }
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // Handle DOCX files using mammoth
        try {
          const bytes = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ buffer: bytes });
          const fileContent = result.value;
          
          if (!fileContent.trim()) {
            return NextResponse.json(
              { 
                error: "Could not extract any text from the DOCX file. The file might be empty or corrupted.", 
                success: false 
              },
              { status: 400 }
            );
          }
          promptParts.push(fileContent);
        } catch (docxError) {
          console.error("Error processing DOCX file:", docxError);
          return NextResponse.json(
            { 
              error: "Failed to process the DOCX file. Please ensure it's a valid Word document.", 
              success: false 
            },
            { status: 400 }
          );
        }
      } else if (file.type === "text/plain") {
        // Handle plain text files
        const fileContent = await file.text();
        if (!fileContent.trim()) {
          return NextResponse.json(
            { 
              error: "Could not extract any text from the file. The file might be empty or corrupted.", 
              success: false 
            },
            { status: 400 }
          );
        }
        promptParts.push(fileContent);
      } else if (file.type.startsWith("image/")) {
        // Handle images (convert to base64 for Gemini)
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        
        promptParts.push({
          inlineData: {
            data: base64,
            mimeType: file.type
          }
        });
      }

      console.log("Sending request to Gemini API...");
      
      // Generate content with Gemini (exact structure from Python)
      const result = await model.generateContent(promptParts);
      const rawAnalysis = result.response.text();
      
      // Format the analysis to remove Markdown symbols while preserving structure
      const formattedAnalysis = formatAnalysisOutput(rawAnalysis);

      return NextResponse.json({
        success: true,
        analysis: formattedAnalysis,
        fileName: file.name,
        fileSize: file.size,
        jobTitle: jobTitle
      });

    } catch (analysisError) {
      console.error("An unexpected error occurred:", analysisError);
      return NextResponse.json(
        { 
          error: `An unexpected error occurred during analysis. Please check the console for details. Error: ${analysisError.message}`, 
          success: false 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error in CV analysis API:", error);
    return NextResponse.json(
      { 
        error: "Internal server error. Please try again later.", 
        success: false 
      },
      { status: 500 }
    );
  }
}