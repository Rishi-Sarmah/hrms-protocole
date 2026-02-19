import { GoogleGenAI } from "@google/genai";
import type { Session } from "../types/session";

export const analyzeReport = async (data: Session, language: string): Promise<string> => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return "Error: API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file.";
  }

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  
  const prompt = `
    You are a senior administrative and operational analyst. Analyze the following report data (Administration, Exploitation, and Budget) provided in JSON format and provide a concise executive summary.
    
    The user's preferred language is: ${language === 'fr' ? 'French' : 'English'}. Please respond in this language.

    Focus on:
    1. Personnel distribution and gender balance.
    2. Significant personnel movements (hiring vs departures).
    3. Medical cost drivers and transfer anomalies.
    4. Operational performance (Exploitation):
       - Import/Export volume and value trends.
       - Lab analysis compliance rates.
    5. Financial Performance (Budget):
       - Execution rates for Production vs Charges.
       - Treasury balance and cash flow health.
    6. Provide 3 actionable recommendations covering HR, Operations, and Finance.

    Data:
    ${JSON.stringify(data, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while communicating with the AI service. Please try again.";
  }
};
