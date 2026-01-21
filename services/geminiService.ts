import { GoogleGenAI, Type } from "@google/genai";

export const MODELS = {
  FAST: 'gemini-3-flash-preview',
  PRO: 'gemini-3-pro-preview',
};

// Helper to create a new AI instance using the environment variable
function getAI() {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not defined. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
}

export async function* askTutorStream(question: string, context?: string) {
  const ai = getAI();
  const systemInstruction = `你是一位博学且友好的大学导师。
    请用专业且通俗易懂的中文回答。
    将复杂的概念分解为简单的步骤。
    如果涉及计算或推导，请显示逻辑过程。
    上下文背景: ${context || '通用大学学科'}`;

  try {
    const response = await ai.models.generateContentStream({
      model: MODELS.PRO,
      contents: question,
      config: { 
        systemInstruction,
        tools: [{ googleSearch: {} }] // Enable grounding for more accurate info
      }
    });
    
    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("AI Error:", error);
    yield "抱歉，AI 助手暂时遇到了连接问题，请检查 API 配置或网络。";
  }
}

export async function* summarizeNotesStream(rawText: string) {
  const ai = getAI();
  const systemInstruction = "你是一位笔记整理专家。请将以下文本或录音转稿转换为结构清晰、层次分明的笔记。包含关键要点、定义和总结。使用中文 Markdown 格式。";
  
  try {
    const response = await ai.models.generateContentStream({
      model: MODELS.FAST,
      contents: `请整理以下内容：${rawText}`,
      config: { systemInstruction }
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    yield "整理笔记时出错，请重试。";
  }
}

export async function* generateStudyPlanStream(goals: string, currentStatus: string) {
  const ai = getAI();
  const response = await ai.models.generateContentStream({
    model: MODELS.PRO,
    contents: `目标：${goals}。当前状态：${currentStatus}`,
    config: {
      systemInstruction: "你是一位学习策略专家。请创建一个详细的 7 天学习计划，包括每日任务、概念拆解和休息时间。使用清晰的中文 Markdown 格式。",
    },
  });

  for await (const chunk of response) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

// Keeping non-streaming functions for one-off analyses
export async function analyzeMood(text: string) {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: MODELS.FAST,
      contents: `分析这段心情日记: "${text}"`,
      config: {
        systemInstruction: "你是校园心理健康助手。请分析心情并返回 JSON：sentiment (心情关键词), feedback (暖心反馈), tip (自愈小建议)。",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING },
            feedback: { type: Type.STRING },
            tip: { type: Type.STRING }
          },
          required: ["sentiment", "feedback", "tip"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { sentiment: '平静', feedback: '感谢你的分享，我在这里听你倾诉。', tip: '深呼吸，去校园散散步吧。' };
  }
}

export async function generateComprehensiveReport(data: any) {
  const ai = getAI();
  try {
    const prompt = `数据记录 - 学习时间: ${JSON.stringify(data.study)}, 心情趋势: ${JSON.stringify(data.mood)}, 积分: ${data.points}`;
    const response = await ai.models.generateContent({
      model: MODELS.PRO,
      contents: prompt,
      config: {
        systemInstruction: "生成学生每周成长报告 JSON。包含 healthScore, studyScore, insight, warning, nextWeekGoal。",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.NUMBER },
            studyScore: { type: Type.NUMBER },
            insight: { type: Type.STRING },
            warning: { type: Type.STRING },
            nextWeekGoal: { type: Type.STRING }
          },
          required: ["healthScore", "studyScore", "insight", "nextWeekGoal"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
}

export async function analyzeStudySession(subject: string, duration: string, details: string, confidence: string) {
  const ai = getAI();
  try {
    const prompt = `科目: ${subject}, 时长: ${duration}min, 细节: ${details}, 自信度: ${confidence}/5.`;
    const response = await ai.models.generateContent({
      model: MODELS.PRO,
      contents: prompt,
      config: {
        systemInstruction: "你是学习分析专家。返回 JSON：summary, gaps (薄弱点数组), recommendation, efficiencyScore (0-100)。",
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
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
}

export async function generateExamRevisionPlan(exams: any[]) {
  const ai = getAI();
  try {
    const examsStr = exams.map(e => `${e.subject} (${e.date})`).join(', ');
    const response = await ai.models.generateContent({
      model: MODELS.PRO,
      contents: `为以下考试制定复习计划: ${examsStr}`,
      config: {
        systemInstruction: "制定考试复习计划 JSON。包含 overview 和 schedule (day, subject, focus, duration)。",
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
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
}