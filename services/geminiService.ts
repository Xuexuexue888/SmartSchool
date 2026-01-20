
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const MODELS = {
  FAST: 'gemini-3-flash-preview',
  PRO: 'gemini-3-pro-preview',
};

export async function askTutor(question: string, context?: string) {
  const systemInstruction = `You are a helpful university academic tutor. 
    Break down complex concepts into simple steps. 
    If asked to solve a problem, show the logical derivation.
    Context: ${context || 'General subjects'}`;

  const response = await ai.models.generateContent({
    model: MODELS.PRO,
    contents: question,
    config: { systemInstruction }
  });
  return response.text;
}

export async function summarizeNotes(rawText: string) {
  const systemInstruction = "You are a note-taking expert. Convert the following transcript or text into a structured, hierarchical set of notes with key takeaways and definitions. Use Markdown formatting.";
  
  const response = await ai.models.generateContent({
    model: MODELS.FAST,
    contents: `Summarize this text: ${rawText}`,
    config: { systemInstruction }
  });
  return response.text;
}

export async function analyzeMood(text: string) {
  const response = await ai.models.generateContent({
    model: MODELS.FAST,
    contents: `Analyze the mood of this journal entry and provide empathetic feedback and one small actionable self-care tip. Journal: "${text}"`,
    config: {
      systemInstruction: "You are a warm, supportive campus mental health assistant. Be empathetic, non-judgmental, and constructive.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sentiment: { type: Type.STRING, description: "One word sentiment (e.g., Happy, Stressed, Anxious)" },
          feedback: { type: Type.STRING },
          tip: { type: Type.STRING }
        },
        required: ["sentiment", "feedback", "tip"]
      }
    }
  });
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { sentiment: 'Unknown', feedback: 'I hear you. Let me know more.', tip: 'Take a deep breath.' };
  }
}

export async function analyzeStudySession(subject: string, duration: string, details: string, confidence: string) {
  const prompt = `Student studied ${subject} for ${duration} minutes. Details: ${details}. Confidence level: ${confidence}/5.`;
  const response = await ai.models.generateContent({
    model: MODELS.PRO,
    contents: prompt,
    config: {
      systemInstruction: "You are an expert academic coach. Analyze the study session log. Provide a summary, identify gaps, give a specific recommendation for next time, and an efficiency score (0-100).",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING },
          efficiencyScore: { type: Type.NUMBER }
        },
        required: ["summary", "gaps", "recommendation", "efficiencyScore"]
      }
    }
  });
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
}

export async function generateExamRevisionPlan(exams: any[]) {
  const examsStr = exams.map(e => `${e.subject} on ${e.date} (Difficulty: ${e.difficulty})`).join(', ');
  const prompt = `Create a prioritized revision schedule for the following exams: ${examsStr}. The plan should focus more time on harder exams and those that are sooner.`;
  
  const response = await ai.models.generateContent({
    model: MODELS.PRO,
    contents: prompt,
    config: {
      systemInstruction: "You are an expert educational consultant. Create a detailed, day-by-day revision schedule in JSON format. Include specific study focus areas for each session.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING },
          schedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                subject: { type: Type.STRING },
                focus: { type: Type.STRING },
                duration: { type: Type.STRING }
              },
              required: ["day", "subject", "focus", "duration"]
            }
          }
        },
        required: ["overview", "schedule"]
      }
    }
  });
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
}
