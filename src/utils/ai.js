const API_KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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
  1. Act exactly like the specified personality, but keep the overall tone very warm, encouraging, and user-friendly.
  2. Ask one question at a time. Keep your questions simple, conversational, and easy to understand. Do NOT ask multiple questions in a single response.
  3. Wait for the user's answer before asking the next question.
  4. Avoid grilling the user too heavily. If their answer is short, gently encourage them or ask a simple, friendly follow-up instead of diving too deep.
  5. Be highly supportive. If the user asks for help, struggles, or doesn't know the answer, explain the concept very simply and kindly. Use simple text-based diagrams or structured bullet points if helpful.
  6. Keep responses concise and conversational, making the user feel relaxed and confident.
  7. When you want to end the interview (e.g., after 5-6 questions), say exactly the phrase: "[INTERVIEW_COMPLETE]" at the very end of your final feedback.`;

  // Format history for Groq API
  let formattedMessages = messages.map(msg => ({
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: msg.content
  }));

  if (formattedMessages.length === 0) {
    formattedMessages = [{
      role: 'user',
      content: `Hello! Please introduce yourself briefly. Then, IMMEDIATELY ask the first interview question. The question MUST strictly be a ${setupData.type} question tailored for a candidate at ${setupData.company}. Do not just say hello, you must include the first question.`
    }];
  }

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      ...formattedMessages
    ],
    temperature: 0.7,
    max_tokens: 500,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate AI response');
    }

    const data = await response.json();
    const generatedQuestion = data.choices[0].message.content;
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
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are an AI that evaluates interviews and MUST output strictly valid JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    response_format: { type: "json_object" }
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate report');
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    return JSON.parse(text);
  } catch (error) {
    console.error("Report Generation Error:", error);
    throw error;
  }
};
