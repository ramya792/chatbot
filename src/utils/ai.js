const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export const generateAIResponse = async (messages, setupData) => {
  console.log("selectedInterviewType:", setupData.type);
  console.log("selectedCompany:", setupData.company);
  console.log("selectedInterviewer:", setupData.personality);

  // Construct the system prompt based on setupData
  const systemPrompt = `You are an AI Interviewer. 
  Your personality is: ${setupData.personality}. 
  The interview type is: ${setupData.type}. 
  The company style is: ${setupData.company}.
  
  Instructions:
  1. Act exactly like the specified personality.
  2. Ask one question at a time. Do NOT ask multiple questions in a single response.
  3. Wait for the user's answer before asking the next question.
  4. If the user's answer is short or lacks detail, ask follow-up questions to probe deeper.
  5. If the user asks for help or doesn't know the answer, explain the concept clearly. If appropriate, use simple text-based diagrams or structured bullet points to help them visualize the concept (Visual Learning Mode).
  6. Keep responses concise and conversational (like a real spoken interview).
  7. When you want to end the interview (e.g., after 5-6 questions), say exactly the phrase: "[INTERVIEW_COMPLETE]" at the very end of your final feedback.`;

  // Format history for Gemini API
  let contents = messages.map(msg => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  if (contents.length === 0) {
    contents = [{
      role: 'user',
      parts: [{ text: `Please introduce yourself briefly and ask the first relevant interview question based on the interview type (${setupData.type}), company (${setupData.company}), and your personality (${setupData.personality}).` }]
    }];
  }

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
    }
  };

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate AI response');
    }

    const data = await response.json();
    const generatedQuestion = data.candidates[0].content.parts[0].text;
    console.log("generatedQuestion:", generatedQuestion);
    return generatedQuestion;
  } catch (error) {
    console.error("AI Error:", error);
    
    if (messages.length === 0) {
      // Fallback questions for different interview types
      let fallbackQuestion = "Hello! Let's start the interview. Can you tell me about yourself?";
      switch (setupData.type) {
        case 'hr':
          fallbackQuestion = "Hello! Let's start with a standard question. Could you please tell me about yourself?";
          break;
        case 'technical':
          fallbackQuestion = "Welcome. Let's dive right into it. Can you explain a complex technical project you've recently worked on?";
          break;
        case 'communication':
          fallbackQuestion = "Hi there. For our first exercise, please describe a time when you had to persuade someone to see your point of view.";
          break;
        case 'aptitude':
          fallbackQuestion = "Welcome. Let's begin with a logical puzzle: If you have a 3-gallon jug and a 5-gallon jug, how can you measure exactly 4 gallons?";
          break;
        case 'self-intro':
          fallbackQuestion = "Hello. We are looking forward to hearing from you. Please give us your 2-minute elevator pitch.";
          break;
      }
      console.log("generatedQuestion (fallback):", fallbackQuestion);
      return fallbackQuestion;
    }

    return "I'm sorry, I encountered a technical issue. Could you please repeat that?";
  }
};

export const generateReport = async (messages) => {
  const prompt = `Analyze the following interview transcript and provide a detailed performance report in valid JSON format.
  
  The JSON must have the following structure:
  {
    "overallScore": number (0-100),
    "communicationScore": number (0-100),
    "technicalScore": number (0-100),
    "confidenceScore": number (0-100),
    "strengths": ["string", "string"],
    "weaknesses": ["string", "string"],
    "improvementAreas": ["string", "string"],
    "summary": "string"
  }
  
  Transcript:
  ${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}
  `;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      response_mime_type: "application/json",
    }
  };

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  } catch (error) {
    console.error("Report Generation Error:", error);
    throw error;
  }
};
