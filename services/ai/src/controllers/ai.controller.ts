import type { Request, Response as ExpressResponse } from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { logger } from '@dissertation/common';

dotenv.config();

const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true';
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';

// Log which mode we're using
if (USE_MOCK_AI) {
  logger.info('🤖 AI Service Mode: MOCK AI (Rule-based)');
} else if (openai) {
  logger.info('🤖 AI Service Mode: OpenAI ChatGPT Integration');
} else {
  logger.warn('⚠️  AI Service Mode: MOCK AI (No OpenAI API key found)');
}

interface ConversationFlowStep {
  questions: string[];
  nextStep: string;
  isMulti?: boolean;
}

interface ConversationFlow {
  [key: string]: ConversationFlowStep;
}

interface SessionData {
  step: string;
  questionIndex: number;
  data: Record<string, any>;
  tempData: Record<string, any>;
}

// Streamlined conversation flow - just 5-6 essential questions
const conversationFlow: ConversationFlow = {
  quickStart: {
    questions: [
      "👋 Welcome! Let's build your amazing portfolio in under 2 minutes!\n\nFirst, what's your full name?",
      "Great! What's your current role or title? (e.g., Full Stack Developer, Software Engineer)",
      "Tell me briefly about your professional background and what you specialize in (1-2 sentences)",
      "What are your main technical skills? (e.g., React, Node.js, Python, AWS)",
      "Share 1-2 key projects or achievements you're proud of",
      "Finally, your email address for contact?"
    ],
    nextStep: 'complete'
  }
};

// Track user session data
const sessions = new Map<string, SessionData>();

export const generatePortfolio = async (req: Request, res: ExpressResponse): Promise<void> => {
  try {
    const { step, userInput, previousData } = req.body;
    const userId = req.headers.authorization?.split(' ')[1] || 'guest';

    // Initialize or get session
    if (!sessions.has(userId)) {
      sessions.set(userId, {
        step: 'quickStart',
        questionIndex: 0,
        data: {},
        tempData: {}
      });
    }

    const session = sessions.get(userId)!;

    // Process user input and generate response
    const result = await processUserInput(session, step, userInput, previousData);

    res.json(result);
  } catch (error) {
    logger.error(`AI Generation Error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: 'Failed to generate portfolio content' });
  }
};

async function processUserInput(
  session: SessionData,
  step: string,
  userInput: string,
  previousData: any
): Promise<any> {
  const flow = conversationFlow[step];

  // If flow doesn't exist, default to quickStart
  if (!flow) {
    session.step = 'quickStart';
    session.questionIndex = 0;
    return {
      response: conversationFlow.quickStart.questions[0],
      nextStep: 'quickStart',
      isComplete: false
    };
  }

  const questionIndex = session.questionIndex || 0;

  // Store the user's answer
  if (!session.tempData[step]) {
    session.tempData[step] = {};
  }

  // Parse and structure the input based on the current step
  const structuredData = structureData(step, questionIndex, userInput, session.tempData[step]);
  Object.assign(session.tempData[step], structuredData);

  // Check if this is a multi-entry section and user wants to add more
  if (flow.isMulti && userInput.toLowerCase().includes('yes') && questionIndex === flow.questions.length - 1) {
    // Reset for another entry in the same section
    session.questionIndex = 0;
    const nextQuestion = flow.questions[0];
    return {
      response: `Great! Let's add another one.\n\n${nextQuestion}`,
      nextStep: step,
      isComplete: false
    };
  }

  // Move to next question or next step
  if (questionIndex + 1 < flow.questions.length) {
    session.questionIndex = questionIndex + 1;
    const nextQuestion = flow.questions[questionIndex + 1];

    return {
      response: nextQuestion,
      nextStep: step,
      isComplete: false
    };
  } else {
    // Finished with current section
    const generatedData = await generateSectionData(step, session.tempData[step], USE_MOCK_AI);

    // For quickStart, generatedData contains ALL sections (intro, about, experience, etc.)
    // Store them directly in session.data, not nested under 'quickStart'
    if (step === 'quickStart') {
      Object.assign(session.data, generatedData);
    } else {
      session.data[step] = generatedData;
    }

    session.questionIndex = 0;
    session.tempData[step] = {};

    const nextStep = flow.nextStep;

    if (nextStep === 'complete') {
      // Portfolio generation complete
      return {
        response: "🎉 Awesome! Your portfolio is ready!\n\nI've generated all sections with the information you provided. You can now:\n• Review and edit each section\n• Preview your portfolio\n• Publish it to get your public URL\n\nClick 'Save & Edit Sections' to refine your portfolio!",
        generatedData: session.data,
        nextStep: null,
        isComplete: true
      };
    } else {
      const nextFlow = conversationFlow[nextStep];
      const nextQuestion = nextFlow.questions[0];

      return {
        response: `Perfect! ✅\n\nNow let's move on to: ${getStepEmoji(nextStep)} ${nextStep.toUpperCase()}\n\n${nextQuestion}`,
        generatedData,
        nextStep,
        isComplete: false
      };
    }
  }
}

function structureData(step: string, questionIndex: number, userInput: string, existingData: Record<string, any>): Record<string, any> {
  const data = { ...existingData };

  if (step === 'quickStart') {
    const fields = ['name', 'title', 'background', 'skills', 'projects', 'email'];
    data[fields[questionIndex]] = userInput;
  }

  return data;
}

async function generateSectionData(step: string, rawData: Record<string, any>, useMock: boolean): Promise<any> {
  if (useMock || !openai) {
    return mockGenerateSectionData(step, rawData);
  }

  try {
    // Use OpenAI to generate enhanced portfolio content
    if (step === 'quickStart') {
      const { name, title, background, skills, projects, email } = rawData;

      const prompt = `You are a professional portfolio writer. Generate comprehensive portfolio content from this information:

Name: ${name}
Role: ${title}
Background: ${background}
Skills: ${skills}
Projects: ${projects}
Email: ${email}

Generate EXACTLY matching Prisma schemas. Return ONLY valid JSON:
{
  "intro": {
    "name": "${name}",
    "titles": "[string array as JSON STRING]",
    "description": "2-3 sentence professional summary",
    "image": ""
  },
  "about": {
    "tagline": "professional tagline",
    "description": "2-3 sentences about professional background",
    "currentFocus": "[array of 2-3 focus areas as JSON STRING]"
  },
  "experience": {
    "companyName": "company name from background or generic",
    "companyLogo": "",
    "companyWebsite": "",
    "role": "job title",
    "startDate": "year as string",
    "endDate": "Present",
    "location": "Remote or location",
    "tagline": "brief role summary",
    "skills": "comma-separated skills",
    "description": "detailed responsibilities 2-3 sentences"
  },
  "projects": [
    {
      "title": "project name",
      "description": "detailed project description",
      "technology": "comma-separated technologies",
      "code": "",
      "demo": "",
      "details": "[]"
    }
  ],
  "skills": {
    "title": "main skill category",
    "icon": "FaCode",
    "color": "#3B82F6",
    "category": "Technical"
  },
  "education": {
    "school": "university name",
    "url": "",
    "location": "",
    "degree": "degree name with field",
    "grade": "",
    "period": "year-range"
  },
  "certificates": [],
  "contact": [
    {
      "icon": "FaEnvelope",
      "label": "Email",
      "href": "mailto:${email}",
      "title": "${email}"
    }
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional portfolio content generator. Always return valid JSON only, no markdown formatting.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const generatedContent = JSON.parse(completion.choices[0].message.content || '{}');
      logger.info('✅ OpenAI generated portfolio content');

      // Ensure arrays are JSON stringified as needed by schemas
      if (generatedContent.intro && Array.isArray(generatedContent.intro.titles)) {
        generatedContent.intro.titles = JSON.stringify(generatedContent.intro.titles);
      }
      if (generatedContent.about && Array.isArray(generatedContent.about.currentFocus)) {
        generatedContent.about.currentFocus = JSON.stringify(generatedContent.about.currentFocus);
      }

      return generatedContent;
    }

    // Fallback to mock for other steps
    return mockGenerateSectionData(step, rawData);
  } catch (error) {
    logger.error(`❌ OpenAI API Error: ${error instanceof Error ? error.message : String(error)}`);
    logger.info('Falling back to Mock AI...');
    return mockGenerateSectionData(step, rawData);
  }
}

function mockGenerateSectionData(step: string, rawData: Record<string, any>): any {
  // Generate ALL portfolio sections from the 6 quick answers
  if (step === 'quickStart') {
    const { name, title, background, skills, projects, email } = rawData;

    // Parse skills from comma-separated string
    const skillsList = skills?.split(',').map((s: string) => s.trim()).filter((s: string) => s) || [];

    // Generate complete portfolio data matching Prisma schemas
    return {
      intro: {
        name: name || 'Portfolio User',
        titles: JSON.stringify([title || 'Software Developer']),
        description: background || 'Passionate professional focused on delivering excellence.',
        image: '' // Default empty, user can upload later
      },
      about: {
        tagline: title || 'Software Developer',
        description: background || 'Passionate professional focused on delivering excellence.',
        currentFocus: JSON.stringify(['Building innovative solutions', 'Continuous learning'])
      },
      experience: {
        companyName: 'Professional Experience',
        companyLogo: '',
        companyWebsite: '',
        role: title || 'Software Developer',
        startDate: (new Date().getFullYear() - 2).toString(),
        endDate: 'Present',
        location: 'Remote',
        tagline: 'Building innovative solutions',
        skills: skills || '',
        description: background || 'Leading development initiatives and delivering high-quality solutions.'
      },
      projects: projects?.split('.').filter((p: string) => p.trim()).slice(0, 2).map((proj: string, idx: number) => ({
        title: `Project ${idx + 1}`,
        description: proj.trim() || 'Innovative project showcasing technical expertise',
        technology: skillsList.slice(0, 4).join(', '),
        code: '',
        demo: '',
        details: '[]' // Empty JSON array
      })) || [],
      skills: {
        title: skills || 'Technical Skills',
        icon: 'FaCode',
        color: '#3B82F6',
        category: 'Technical'
      },
      education: {
        school: 'University',
        url: '',
        location: '',
        degree: 'Bachelor\'s Degree in Computer Science',
        grade: '',
        period: `${new Date().getFullYear() - 7} - ${new Date().getFullYear() - 3}`
      },
      certificates: [],
      contact: email ? [
        { icon: 'FaEnvelope', label: 'Email', href: `mailto:${email}`, title: email }
      ] : []
    };
  }

  // Legacy section-by-section generation (kept for backward compatibility)
  switch (step) {
    case 'intro':
      return {
        name: rawData.name || 'Portfolio User',
        titles: JSON.stringify(rawData.titles || ['Software Developer']),
        email: rawData.email || '',
        phone: rawData.phone || '',
        location: rawData.location || ''
      };

    case 'about':
      return {
        description: rawData.description || '',
        currentFocus: JSON.stringify([rawData.currentFocus || 'Building great software']),
        expertise: rawData.expertise || ''
      };

    case 'experience':
      return {
        position: rawData.position || '',
        company: rawData.company || '',
        startDate: rawData.startDate || '',
        endDate: rawData.endDate || '',
        responsibilities: rawData.responsibilities || '',
        skills: rawData.skills || '',
        location: 'Remote'
      };

    case 'projects':
      return {
        title: rawData.title || '',
        description: rawData.description || '',
        technology: rawData.technology || '',
        demoLink: rawData.demoLink || '',
        githubLink: rawData.demoLink || '',
        outcome: rawData.outcome || ''
      };

    case 'skills':
      return {
        skills: rawData.skills || '',
        level: rawData.level || 'Intermediate'
      };

    case 'education':
      return {
        degree: rawData.degree || '',
        institution: rawData.institution || '',
        fieldOfStudy: rawData.fieldOfStudy || '',
        graduationYear: rawData.graduationYear || '',
        location: ''
      };

    case 'certificates':
      if (rawData.skip) return null;
      return {
        name: rawData.name || '',
        issuedBy: rawData.issuedBy || '',
        year: rawData.year || ''
      };

    case 'contact':
      const contacts = [];
      if (rawData.linkedin) {
        contacts.push({ type: 'LinkedIn', value: rawData.linkedin, icon: 'FaLinkedin' });
      }
      if (rawData.github) {
        contacts.push({ type: 'GitHub', value: rawData.github, icon: 'FaGithub' });
      }
      if (rawData.other) {
        contacts.push({ type: 'Website', value: rawData.other, icon: 'FaExternalLink' });
      }
      return contacts;

    default:
      return rawData;
  }
}

function getStepEmoji(step: string): string {
  const emojis: Record<string, string> = {
    intro: '👋',
    about: '📖',
    experience: '💼',
    projects: '🚀',
    skills: '⚡',
    education: '🎓',
    certificates: '📜',
    contact: '📧'
  };
  return emojis[step] || '📝';
}

export const savePortfolio = async (req: Request, res: ExpressResponse): Promise<void> => {
  try {
    const portfolioData = req.body;
    const userId = req.headers.authorization?.split(' ')[1];

    logger.info(`📥 Saving portfolio data for user: ${userId}`);
    logger.info(`Data sections: ${Object.keys(portfolioData).join(', ')}`);

    // Save each section to respective microservice
    const savePromises: Array<Promise<globalThis.Response>> = [];

    // Helper to check if data exists and get ID
    const checkAndSave = async (section: string, data: unknown): Promise<globalThis.Response> => {
      try {
        // Fetch existing data
        const getResponse = await fetch(`${GATEWAY_URL}/admin/${section}`, {
          headers: { 'Authorization': req.headers.authorization || '' }
        });
        const existing = await getResponse.json();

        // For single-entry sections (intro, about), update if exists
        if (Array.isArray(existing) && existing.length > 0) {
          const existingId = existing[0].id;
          return fetch(`${GATEWAY_URL}/admin/${section}/${existingId}`, {
            method: 'PUT',
            headers: {
              'Authorization': req.headers.authorization || '',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
        }
      } catch (err) {
        logger.info(`No existing ${section}, creating new...`);
      }

      // Create new if doesn't exist
      return fetch(`${GATEWAY_URL}/admin/${section}`, {
        method: 'POST',
        headers: {
          'Authorization': req.headers.authorization || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    };

    // Save intro (single entry - update if exists)
    if (portfolioData.intro) {
      savePromises.push(checkAndSave('intro', portfolioData.intro));
    }

    // Save about (single entry - update if exists)
    if (portfolioData.about) {
      savePromises.push(checkAndSave('about', portfolioData.about));
    }

    // Save experience
    if (portfolioData.experience) {
      savePromises.push(
        fetch(`${GATEWAY_URL}/admin/experience`, {
          method: 'POST',
          headers: {
            'Authorization': req.headers.authorization || '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(portfolioData.experience)
        })
      );
    }

    // Save projects - handle array of projects
    if (portfolioData.projects) {
      const projectsArray = Array.isArray(portfolioData.projects)
        ? portfolioData.projects
        : [portfolioData.projects];

      projectsArray.forEach((project: unknown) => {
        savePromises.push(
          fetch(`${GATEWAY_URL}/admin/projects`, {
            method: 'POST',
            headers: {
              'Authorization': req.headers.authorization || '',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(project)
          })
        );
      });
    }

    // Save skills
    if (portfolioData.skills) {
      savePromises.push(
        fetch(`${GATEWAY_URL}/admin/skills`, {
          method: 'POST',
          headers: {
            'Authorization': req.headers.authorization || '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(portfolioData.skills)
        })
      );
    }

    // Save education
    if (portfolioData.education) {
      savePromises.push(
        fetch(`${GATEWAY_URL}/admin/education`, {
          method: 'POST',
          headers: {
            'Authorization': req.headers.authorization || '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(portfolioData.education)
        })
      );
    }

    // Save certificates - handle array of certificates
    if (portfolioData.certificates && Array.isArray(portfolioData.certificates) && portfolioData.certificates.length > 0) {
      portfolioData.certificates.forEach((certificate: unknown) => {
        savePromises.push(
          fetch(`${GATEWAY_URL}/admin/certificates`, {
            method: 'POST',
            headers: {
              'Authorization': req.headers.authorization || '',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(certificate)
          })
        );
      });
    }

    // Save contacts
    if (portfolioData.contact && Array.isArray(portfolioData.contact)) {
      portfolioData.contact.forEach((contact: unknown) => {
        savePromises.push(
          fetch(`${GATEWAY_URL}/admin/contact`, {
            method: 'POST',
            headers: {
              'Authorization': req.headers.authorization || '',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(contact)
          })
        );
      });
    }

    logger.info(`📤 Sending ${savePromises.length} API requests to save portfolio sections...`);
    const results = await Promise.all(savePromises);

    // Check for any failed requests
    const failedRequests = results.filter(r => !r.ok);
    if (failedRequests.length > 0) {
      logger.error(`❌ ${failedRequests.length} requests failed`);
      for (const failed of failedRequests) {
        const errorText = await failed.text();
        logger.error(`Failed request: ${failed.url} - ${failed.status} - ${errorText}`);
      }
    } else {
      logger.info('✅ All portfolio sections saved successfully!');
    }

    // Clear session
    if (userId) {
      sessions.delete(userId);
    }

    res.json({ success: true, message: 'Portfolio saved successfully', savedSections: results.length });
  } catch (error) {
    logger.error(`❌ Save Error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: 'Failed to save portfolio', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};
