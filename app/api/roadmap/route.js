import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const FICTIONAL_CAREERS_BLOCKLIST = [
  'jedi', 'wizard', 'dragon rider', 'superhero', 'hobbit', 'elf',
  'vampire hunter', 'time lord', 'starfleet'
];

function generateCareerSpecificFallback(career) {
  const careerLower = career.toLowerCase();
  
  // Technology & Software
  if (careerLower.includes('developer') || careerLower.includes('engineer') || careerLower.includes('programmer')) {
    return {
      career: career,
      roadmap: {
        id: "start",
        label: "Begin Your Journey",
        contentFile: `Welcome to your ${career} roadmap! This comprehensive path will guide you from beginner to professional. Software development is a rewarding career with endless opportunities for growth and innovation.\n\nYou'll learn programming fundamentals, master essential tools, and build real-world projects. The tech industry values continuous learning, so embrace challenges and stay curious.\n\nLet's start building your future in technology!`,
        children: [
          {
            id: "programming-fundamentals",
            label: "Programming Fundamentals",
            contentFile: "Master the core concepts that every developer needs. Learn variables, data types, control structures (if/else, loops), functions, and object-oriented programming principles.\n\nUnderstand how to break down problems, write clean code, and debug effectively. These fundamentals apply across all programming languages and are essential for your career.\n\nPractice with small projects like calculators, simple games, or automation scripts to solidify your understanding.",
            children: [
              {
                id: "data-structures-algorithms",
                label: "Data Structures & Algorithms",
                contentFile: "Learn essential data structures like arrays, linked lists, stacks, queues, trees, and graphs. Understand their use cases and performance characteristics.\n\nMaster common algorithms for sorting, searching, and problem-solving. Practice coding challenges on platforms like LeetCode or HackerRank to sharpen your skills.\n\nThese concepts are crucial for technical interviews and writing efficient code in production environments.",
                children: [
                  {
                    id: "version-control",
                    label: "Version Control (Git)",
                    contentFile: "Git is the industry standard for tracking code changes and collaborating with teams. Learn basic commands (clone, add, commit, push, pull) and branching strategies.\n\nUnderstand how to resolve merge conflicts, create pull requests, and follow collaborative workflows. GitHub or GitLab will be your portfolio platform.\n\nEvery professional developer uses version control daily - it's non-negotiable for modern software development.",
                    children: [
                      {
                        id: "frameworks-libraries",
                        label: "Frameworks & Libraries",
                        contentFile: "Master popular frameworks and libraries relevant to your specialization. For web: React, Angular, or Vue. For backend: Node.js, Django, or Spring.\n\nLearn how to leverage existing tools to build applications faster and more efficiently. Understand framework conventions, best practices, and ecosystem.\n\nBuild several projects using different frameworks to discover which tools you enjoy working with most.",
                        children: [
                          {
                            id: "professional-development",
                            label: "Career Readiness",
                            contentFile: "Build an impressive portfolio with 3-5 polished projects showcasing different skills. Create a strong GitHub profile and LinkedIn presence.\n\nContribute to open-source projects to gain real-world experience and network with other developers. Practice explaining your technical decisions clearly.\n\nPrepare for interviews, apply strategically, and continue learning throughout your career. The journey never truly ends in tech!",
                            children: []
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    };
  }
  
  // Data & Analytics
  else if (careerLower.includes('data') || careerLower.includes('scientist') || careerLower.includes('analyst')) {
    return {
      career: career,
      roadmap: {
        id: "start",
        label: "Start Data Journey",
        contentFile: `Begin your career in ${career}! Data professionals are in high demand across all industries. You'll learn to extract insights from data, build predictive models, and drive business decisions.\n\nThis field combines statistics, programming, and domain knowledge. You'll work with massive datasets, cutting-edge AI tools, and solve real-world problems.\n\nThe journey requires strong analytical thinking and continuous learning as the field evolves rapidly.`,
        children: [
          {
            id: "statistics-foundation",
            label: "Statistics & Math",
            contentFile: "Master statistics and probability theory - the foundation of all data work. Learn descriptive statistics, probability distributions, hypothesis testing, and statistical inference.\n\nUnderstand concepts like correlation, regression, p-values, confidence intervals, and experimental design. These are essential for making data-driven decisions.\n\nPractice with real datasets and learn to interpret results correctly - this is where many data projects succeed or fail.",
            children: [
              {
                id: "programming-python",
                label: "Python/R Programming",
                contentFile: "Learn Python or R for data analysis. Python is more versatile, while R excels at statistical computing. Master data manipulation libraries like pandas, NumPy, and data visualization with matplotlib or ggplot2.\n\nUnderstand how to clean messy data, handle missing values, and perform exploratory data analysis. Write efficient, readable code following best practices.\n\nBuild analysis scripts and automate repetitive data tasks to save time and reduce errors.",
                children: [
                  {
                    id: "machine-learning",
                    label: "Machine Learning",
                    contentFile: "Study supervised and unsupervised learning algorithms. Master regression, classification, clustering, and dimensionality reduction techniques using scikit-learn or similar libraries.\n\nLearn feature engineering, model selection, cross-validation, and evaluation metrics. Understand when to use which algorithm and how to tune hyperparameters.\n\nWork on projects like house price prediction, customer segmentation, or fraud detection to apply your knowledge.",
                    children: [
                      {
                        id: "career-portfolio",
                        label: "Build Portfolio",
                        contentFile: "Create a portfolio of data projects showcasing end-to-end analysis skills. Include projects with real datasets, clear visualizations, and actionable insights.\n\nLearn cloud platforms (AWS, GCP, Azure) and deployment tools. Understand MLOps basics for productionizing models. Share your work on GitHub and write blog posts explaining your approach.\n\nNetwork with data professionals, attend meetups, and stay updated with the latest tools and techniques in this fast-evolving field.",
                        children: []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    };
  }
  
  // Design & Creative
  else if (careerLower.includes('design') || careerLower.includes('ui') || careerLower.includes('ux') || careerLower.includes('graphic')) {
    return {
      career: career,
      roadmap: {
        id: "start",
        label: "Begin Design Path",
        contentFile: `Welcome to your ${career} journey! Design is about solving problems creatively while making experiences beautiful and intuitive. You'll learn to balance aesthetics with functionality.\n\nDesigners are crucial in creating products people love to use. Whether digital or physical, good design makes the complex simple and delightful.\n\nThis creative field requires both artistic sensibility and analytical thinking. Let's build your design expertise!`,
        children: [
          {
            id: "design-fundamentals",
            label: "Design Principles",
            contentFile: "Master core design principles: balance, contrast, hierarchy, alignment, proximity, and repetition. Learn color theory, typography basics, and composition.\n\nUnderstand how visual elements guide user attention and create emotional responses. Study great designs and analyze what makes them effective.\n\nPractice by creating simple designs daily - posters, logos, or UI mockups. Develop your eye for good design through constant observation and iteration.",
            children: [
              {
                id: "design-tools",
                label: "Master Design Tools",
                contentFile: "Learn industry-standard tools like Figma, Adobe XD, Sketch, or Illustrator/Photoshop. Figma is currently the most popular for UI/UX with excellent collaboration features.\n\nUnderstand layers, components, constraints, and prototyping. Learn keyboard shortcuts to work efficiently. Explore plugin ecosystems to enhance your workflow.\n\nCreate increasingly complex designs as you master the tools. Speed and efficiency come with practice and muscle memory.",
                children: [
                  {
                    id: "user-research",
                    label: "User Research & Testing",
                    contentFile: "Learn to conduct user interviews, surveys, and usability testing. Understand user personas, journey maps, and pain point analysis.\n\nGood design is based on real user needs, not assumptions. Learn to gather and interpret user feedback to make data-driven design decisions.\n\nPractice empathy - put yourself in users' shoes. Test your designs with real users and iterate based on their feedback.",
                    children: [
                      {
                        id: "portfolio-career",
                        label: "Professional Portfolio",
                        contentFile: "Build a compelling portfolio showcasing 5-8 of your best projects. Include case studies explaining your design process, challenges faced, and solutions implemented.\n\nCreate a personal brand with a strong online presence. Network with other designers, contribute to design communities, and stay updated with trends.\n\nApply for positions or freelance work. Keep learning - design trends, tools, and best practices evolve constantly. Your learning never stops!",
                        children: []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    };
  }
  
  // Healthcare & Medical
  else if (careerLower.includes('doctor') || careerLower.includes('nurse') || careerLower.includes('medical') || careerLower.includes('physician') || careerLower.includes('healthcare')) {
    return {
      career: career,
      roadmap: [
        { title: "Education Foundation", steps: ["Complete required pre-med courses", "Maintain strong GPA", "Gain healthcare volunteer experience", "Prepare for entrance exams", "Apply to professional schools"] },
        { title: "Professional Training", steps: ["Complete degree program", "Gain clinical experience", "Pass licensing exams", "Complete residency/internship", "Pursue specialization if desired"] },
        { title: "Career Establishment", steps: ["Obtain necessary licenses", "Build professional network", "Join professional organizations", "Pursue continuing education", "Consider subspecialties"] }
      ]
    };
  }
  
  // Business & Finance
  else if (careerLower.includes('business') || careerLower.includes('finance') || careerLower.includes('accounting') || careerLower.includes('marketing') || careerLower.includes('manager')) {
    return {
      career: career,
      roadmap: [
        { title: "Business Foundation", steps: ["Complete business education", "Learn industry fundamentals", "Develop analytical skills", "Gain internship experience", "Build professional network"] },
        { title: "Skill Development", steps: ["Master relevant tools and software", "Develop leadership skills", "Gain practical experience", "Pursue certifications", "Build industry expertise"] },
        { title: "Career Growth", steps: ["Take on leadership roles", "Expand professional network", "Pursue advanced education (MBA)", "Develop strategic thinking", "Mentor others"] }
      ]
    };
  }
  
  // Teaching & Education
  else if (careerLower.includes('teacher') || careerLower.includes('professor') || careerLower.includes('educator') || careerLower.includes('instructor')) {
    return {
      career: career,
      roadmap: [
        { title: "Educational Foundation", steps: ["Complete teaching degree", "Specialize in subject area", "Complete student teaching", "Pass certification exams", "Understand pedagogy"] },
        { title: "Teaching Practice", steps: ["Gain classroom experience", "Develop curriculum", "Master classroom management", "Use educational technology", "Pursue continuing education"] },
        { title: "Professional Growth", steps: ["Pursue advanced degrees", "Take on leadership roles", "Mentor new teachers", "Publish educational content", "Join professional organizations"] }
      ]
    };
  }
  
  // Law & Legal
  else if (careerLower.includes('lawyer') || careerLower.includes('attorney') || careerLower.includes('legal') || careerLower.includes('paralegal')) {
    return {
      career: career,
      roadmap: [
        { title: "Legal Education", steps: ["Complete undergraduate degree", "Prepare for and take LSAT", "Apply to law schools", "Complete law degree", "Gain legal internships"] },
        { title: "Bar Preparation", steps: ["Study for bar exam", "Pass bar exam", "Complete ethics requirements", "Gain practical experience", "Choose practice area"] },
        { title: "Legal Career", steps: ["Build case experience", "Develop client relationships", "Join legal organizations", "Pursue specializations", "Consider partnership or opening practice"] }
      ]
    };
  }
  
  // Arts & Entertainment
  else if (careerLower.includes('artist') || careerLower.includes('musician') || careerLower.includes('actor') || careerLower.includes('writer') || careerLower.includes('photographer')) {
    return {
      career: career,
      roadmap: [
        { title: "Skill Development", steps: ["Master your craft", "Study techniques and theory", "Practice consistently", "Learn from mentors", "Build foundational skills"] },
        { title: "Portfolio Building", steps: ["Create professional portfolio", "Develop unique style", "Complete diverse projects", "Gain public exposure", "Network in industry"] },
        { title: "Professional Career", steps: ["Market yourself effectively", "Build client base", "Pursue opportunities", "Collaborate with others", "Continuously evolve artistically"] }
      ]
    };
  }
  
  // Engineering (Non-Software)
  else if (careerLower.includes('civil') || careerLower.includes('mechanical') || careerLower.includes('electrical') || careerLower.includes('chemical')) {
    return {
      career: career,
      roadmap: [
        { title: "Engineering Education", steps: ["Complete engineering degree", "Master mathematics and physics", "Learn CAD and design tools", "Gain internship experience", "Pass FE exam"] },
        { title: "Professional Experience", steps: ["Work under licensed engineer", "Gain practical experience", "Learn industry standards", "Prepare for PE exam", "Build technical expertise"] },
        { title: "Professional Engineer", steps: ["Obtain PE license", "Lead engineering projects", "Mentor junior engineers", "Pursue specializations", "Stay updated with technology"] }
      ]
    };
  }
  
  // Trades & Technical
  else if (careerLower.includes('electrician') || careerLower.includes('plumber') || careerLower.includes('carpenter') || careerLower.includes('mechanic') || careerLower.includes('technician')) {
    return {
      career: career,
      roadmap: [
        { title: "Training & Apprenticeship", steps: ["Complete trade school or vocational training", "Find apprenticeship program", "Learn safety procedures", "Master basic techniques", "Understand industry codes"] },
        { title: "Journeyman Level", steps: ["Complete apprenticeship hours", "Pass journeyman exam", "Gain diverse experience", "Build professional reputation", "Continue learning"] },
        { title: "Master Level", steps: ["Pursue master certification", "Start own business or supervise", "Mentor apprentices", "Stay updated with codes", "Expand service offerings"] }
      ]
    };
  }
  
  // Science & Research
  else if (careerLower.includes('scientist') || careerLower.includes('researcher') || careerLower.includes('biologist') || careerLower.includes('chemist') || careerLower.includes('physicist')) {
    return {
      career: career,
      roadmap: [
        { title: "Academic Foundation", steps: ["Complete science degree", "Gain lab experience", "Learn research methodology", "Develop analytical skills", "Pursue graduate education"] },
        { title: "Research Development", steps: ["Complete advanced degree", "Conduct original research", "Publish findings", "Attend conferences", "Build research network"] },
        { title: "Professional Career", steps: ["Secure research position", "Lead research projects", "Mentor students", "Pursue grants and funding", "Contribute to field advancement"] }
      ]
    };
  }
  
  // Generic fallback for any other career
  else {
    return {
      career: career,
      roadmap: {
        id: "start",
        label: "Career Start",
        contentFile: `Welcome to your ${career} career roadmap! Every successful career begins with learning the fundamentals and building practical experience. This path will guide you from beginner to professional.\n\nWhile every career has unique requirements, the core principles remain the same: continuous learning, practical application, and professional networking.\n\nLet's build a strong foundation and progressively develop your expertise in ${career}!`,
        children: [
          {
            id: "education-foundation",
            label: "Education & Foundation",
            contentFile: `Complete the required education and certifications for ${career}. Research the typical educational path - whether it's a degree, vocational training, or self-study.\n\nLearn the fundamental concepts, terminology, and principles that form the basis of this career. Build a strong theoretical foundation before diving into practical work.\n\nConnect with professionals in the field to understand current industry standards and expectations. Join relevant communities and forums.`,
            children: [
              {
                id: "skill-development",
                label: "Skill Development",
                contentFile: `Develop the core competencies required for ${career}. Focus on both technical skills and soft skills like communication, problem-solving, and time management.\n\nWork on practical projects to apply your knowledge. Seek internships, volunteer opportunities, or entry-level positions to gain real-world experience.\n\nFind a mentor who can guide your development and provide industry insights. Learn from their experiences and mistakes.`,
                children: [
                  {
                    id: "professional-growth",
                    label: "Professional Growth",
                    contentFile: `Build a professional portfolio showcasing your best work. Pursue advanced certifications or specialized training to stand out in your field.\n\nExpand your professional network through industry events, conferences, and online communities. Build relationships that can lead to opportunities.\n\nStay current with industry trends and continuously update your skills. Take on leadership roles and mentor others as you grow in your career.`,
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    };
  }
}

const SYSTEM_PROMPT = `
You are an expert career counselor. Your task is to generate a structured career roadmap for a given profession as a flowchart-compatible tree structure.
You MUST provide the output as a clean JSON object, without any surrounding text or markdown.

The roadmap should be a tree structure where each node represents a learning milestone or skill.
Each node should have:
- id: A unique string identifier (use kebab-case, e.g., "learn-html", "frontend-basics-1")
- label: The title/name of this milestone (e.g., "Learn HTML", "Master JavaScript")
- contentFile: A markdown-formatted string (1-3 paragraphs) describing this topic, why it's important, and what you'll learn
- children: An array of child nodes that come after this one (can be empty for leaf nodes)

Here is an example of the required structure:
{
  "career": "Frontend Developer",
  "roadmap": {
    "id": "start",
    "label": "Start Your Journey",
    "contentFile": "Welcome to the Frontend Developer roadmap! This journey will take you from complete beginner to job-ready frontend developer. You'll learn how to build beautiful, interactive websites and applications that millions of people can use.\\n\\nFrontend development is one of the most accessible tech careers, with high demand and great salary potential. Let's begin with the fundamentals and progressively build your skills.\\n\\nRemember: consistency is key. Dedicate time daily, build projects, and don't be afraid to make mistakes!",
    "children": [
      {
        "id": "html-basics",
        "label": "HTML Fundamentals",
        "contentFile": "HTML (HyperText Markup Language) is the backbone of all web pages. It provides the structure and content of websites using elements like headings, paragraphs, links, images, and forms.\\n\\nYou'll learn about semantic HTML, proper document structure, accessibility basics, and how to create well-organized web pages. Master elements like div, span, header, nav, main, footer, and form elements.\\n\\nPractice by building simple static pages like a personal portfolio, a blog layout, or a product landing page.",
        "children": [
          {
            "id": "css-basics",
            "label": "CSS Styling",
            "contentFile": "CSS (Cascading Style Sheets) brings life to your HTML by adding colors, layouts, animations, and responsive design. Learn selectors, the box model, flexbox, grid, and CSS variables.\\n\\nYou'll master positioning, typography, colors, gradients, shadows, and transitions to create beautiful user interfaces. Understanding responsive design with media queries is crucial for modern web development.\\n\\nBuild styled versions of your HTML projects, experimenting with different layouts and color schemes.",
            "children": [
              {
                "id": "javascript-basics",
                "label": "JavaScript Fundamentals",
                "contentFile": "JavaScript makes websites interactive and dynamic. Learn variables, data types, functions, loops, conditionals, and DOM manipulation to control page behavior.\\n\\nYou'll understand event handling, asynchronous programming, fetch API, and ES6+ features like arrow functions, destructuring, and promises.\\n\\nCreate interactive projects like a to-do list, calculator, weather app, or quiz game to practice your skills.",
                "children": []
              }
            ]
          }
        ]
      }
    ]
  }
}

Important guidelines:
- Create a logical progression from beginner to advanced
- Each node's contentFile should be 1-3 informative paragraphs in markdown format
- Use \\n\\n for paragraph breaks in the contentFile
- Branch the tree where there are parallel learning paths or specializations
- Keep node labels concise (2-5 words)
- Make IDs unique and descriptive (use kebab-case)
- Include 4-8 major nodes with appropriate children
- Don't generate roadmaps for fictional careers

Ensure the roadmap is comprehensive, practical, and covers key skills, technologies, and milestones for the given career.
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
    const response = result.response;
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

    // Validate the structure (new tree format)
    if (!roadmapData.roadmap || typeof roadmapData.roadmap !== 'object' || !roadmapData.roadmap.id) {
      console.error('Invalid roadmap structure:', roadmapData);
      return NextResponse.json(
        { error: 'Invalid roadmap structure received from AI' },
        { status: 500 }
      );
    }

    // Validate that the root node has required fields
    const rootNode = roadmapData.roadmap;
    if (!rootNode.label || !rootNode.contentFile || !Array.isArray(rootNode.children)) {
      console.error('Invalid root node structure:', rootNode);
      return NextResponse.json(
        { error: 'Invalid node structure in roadmap' },
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