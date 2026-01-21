import { GoogleGenAI, Type } from "@google/genai";

export const MODELS = {
  FAST: 'gemini-3-flash-preview',
  PRO: 'gemini-3-pro-preview',
};

// Fix: Use process.env.API_KEY directly in the named parameter as per guidelines
function getAI() {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

/**
 * 基础流式生成函数
 */
async function* baseStream(model: string, prompt: string, systemInstruction: string, tools?: any[]) {
  const ai = getAI();
  try {
    const response = await ai.models.generateContentStream({
      model: model,
      contents: prompt,
      config: { systemInstruction, tools }
    });
    for await (const chunk of response) {
      if (chunk.text) yield chunk.text;
    }
  } catch (error) {
    console.error("Streaming Error:", error);
    yield " [服务连接异常，请重试] ";
  }
}

export async function* askTutorStream(question: string, context?: string) {
  const systemInstruction = `你是一位博学且友好的大学导师。请用专业且通俗易懂的中文回答。上下文背景: ${context || '通用大学学科'}`;
  yield* baseStream(MODELS.PRO, question, systemInstruction, [{ googleSearch: {} }]);
}

export async function* summarizeNotesStream(rawText: string) {
  const systemInstruction = "你是一位笔记整理专家。请将以下文本转换为结构清晰、层次分明的中文 Markdown 笔记。";
  yield* baseStream(MODELS.FAST, `请整理内容：${rawText}`, systemInstruction);
}

export async function* generateStudyPlanStream(goals: string, currentStatus: string) {
  const systemInstruction = "你是一位学习策略专家。请创建一个详细的 7 天学习计划。";
  yield* baseStream(MODELS.PRO, `目标：${goals}。状态：${currentStatus}`, systemInstruction);
}

/**
 * 带有 JSON 结构的流式分析 (流文本用于显示，最终结果用于结构化 UI)
 */
export async function* analyzeMoodStream(text: string) {
  const ai = getAI();
  const systemInstruction = "你是校园心理健康助手。分析心情并返回 JSON：sentiment, feedback (详细暖心反馈), tip (自愈建议)。";
  const response = await ai.models.generateContentStream({
    model: MODELS.FAST,
    contents: `分析心情: "${text}"`,
    config: {
      systemInstruction,
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
  for await (const chunk of response) {
    if (chunk.text) yield chunk.text;
  }
}

export async function* analyzeStudySessionStream(subject: string, duration: string, details: string, confidence: string) {
  const ai = getAI();
  const systemInstruction = "你是学习分析专家。返回 JSON：summary (详细分析流), gaps (数组), recommendation, efficiencyScore (数字)。";
  const prompt = `科目: ${subject}, 时长: ${duration}min, 细节: ${details}, 自信度: ${confidence}/5.`;
  const response = await ai.models.generateContentStream({
    model: MODELS.PRO,
    contents: prompt,
    config: {
      systemInstruction,
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
  for await (const chunk of response) {
    if (chunk.text) yield chunk.text;
  }
}

export async function* generateExamRevisionPlanStream(exams: any[]) {
  const ai = getAI();
  const examsStr = exams.map(e => `${e.subject} (${e.date})`).join(', ');
  const systemInstruction = "制定考试复习计划 JSON。包含 overview (详细流式综述) 和 schedule (day, subject, focus, duration)。";
  const response = await ai.models.generateContentStream({
    model: MODELS.PRO,
    contents: `考试: ${examsStr}`,
    config: {
      systemInstruction,
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
              }
            }
          }
        },
        required: ["overview", "schedule"]
      }
    }
  });
  for await (const chunk of response) {
    if (chunk.text) yield chunk.text;
  }
}

export async function* generateComprehensiveReportStream(data: any) {
  const ai = getAI();
  const prompt = `数据 - 学习: ${JSON.stringify(data.study)}, 积分: ${data.points}`;
  const systemInstruction = "生成周成长报告 JSON。包含 healthScore, studyScore, insight (深度流式洞察), warning, nextWeekGoal。";
  const response = await ai.models.generateContentStream({
    model: MODELS.PRO,
    contents: prompt,
    config: {
      systemInstruction,
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
  for await (const chunk of response) {
    if (chunk.text) yield chunk.text;
  }
}