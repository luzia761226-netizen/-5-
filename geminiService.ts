
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * Generates a question with Grounding capabilities for high accuracy and divergent thinking.
 */
export async function generatePedagogicalQuestions(
  subject: string, 
  grade: number, 
  achievement: string,
  level: string,
  difficulty: string,
  type: string,
  location?: { latitude: number, longitude: number }
): Promise<Question> {
  
  // Choose model based on task complexity
  const modelName = (level === "창의" || level === "평가") ? "gemini-3-pro-preview" : "gemini-3-flash-preview";
  
  // Define tools based on subject context
  const tools: any[] = [];
  if (subject === "사회" || subject === "과학") {
    tools.push({ googleSearch: {} });
  }
  if (location && (subject === "수학" || subject === "사회")) {
    tools.push({ googleMaps: {} });
  }

  const prompt = `
    당신은 30년 경력의 대한민국 교육 전문가입니다.
    초등학교 ${grade}학년 ${subject} 교과과정의 성취기준 [${achievement}]을(를) 기반으로 문제를 생성하세요.
    
    [핵심 지침]
    1. 인지 수준: ${level} (확산적 사고와 창의적 해결책을 유도할 것)
    2. 난이도: ${difficulty}
    3. 문제 유형: ${type}
    4. 중복 방지: 절대 뻔한 예시(사과 3개 등)를 쓰지 말고, 최신 시사 뉴스나 실제 지리 정보를 활용하여 흥미진진한 시나리오를 만드세요.
    
    [Grounding 활용]
    - ${subject === '과학' ? '최근 발견된 과학적 사실이나 실시간 환경 데이터를 반영하세요.' : ''}
    - ${location ? `사용자의 현재 위치(위도: ${location.latitude}, 경도: ${location.longitude}) 주변의 지형이나 시설을 문제의 배경으로 활용하세요.` : ''}

    반드시 JSON 형식으로 응답하세요.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      tools: tools.length > 0 ? tools : undefined,
      toolConfig: location ? {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }
      } : undefined,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question_text: { type: Type.STRING, description: "풍부한 맥락을 가진 문제 텍스트" },
          answer_key: { type: Type.STRING, description: "정답 (짧게)" },
          explanation: { type: Type.STRING, description: "전문가적인 상세 해설" },
          source_urls: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "참고한 실제 정보의 URL (Search/Maps Grounding 결과)"
          }
        },
        required: ["question_text", "answer_key", "explanation"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  // Extract URLs from grounding metadata if available
  const groundingUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => chunk.web?.uri || chunk.maps?.uri)
    .filter(Boolean) || [];

  return {
    id: Math.random().toString(36).substr(2, 9),
    subject,
    grade,
    achievement,
    cognitive_level: level,
    difficulty,
    type,
    question: data.question_text,
    answer_key: data.answer_key,
    explanation: data.explanation,
    timestamp: Date.now(),
    status: 'pending'
  };
}

export async function validateAnswer(question: string, correctAnswer: string, userAnswer: string): Promise<boolean> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Question: ${question}\nTarget Answer: ${correctAnswer}\nUser's Submission: ${userAnswer}\nIs this essentially correct? JSON boolean "isCorrect" only.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { isCorrect: { type: Type.BOOLEAN } },
        required: ["isCorrect"]
      }
    }
  });
  return JSON.parse(response.text || "{}").isCorrect;
}
