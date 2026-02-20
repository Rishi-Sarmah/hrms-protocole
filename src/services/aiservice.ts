import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import type { Session } from "../types/session";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AnalyzeRequest {
  data: Session;
  language: string;
}

interface AnalyzeResponse {
  text: string;
}

// ─── Cloud Function callable reference ──────────────────────────────────────

const analyzeReportFunction = httpsCallable<AnalyzeRequest, AnalyzeResponse>(
  functions,
  "analyzeReport"
);

// ─── Service ────────────────────────────────────────────────────────────────

/**
 * Analyzes a session report using the secure Cloud Function.
 * This function sends the session data to the backend where the Gemini API
 * is called securely without exposing the API key in the browser.
 * 
 * @param data - The session data to analyze
 * @param language - The user's preferred language ('en' or 'fr')
 * @returns A promise that resolves to the analysis text
 */
export const analyzeReport = async (data: Session, language: string): Promise<string> => {
  try {
    const result = await analyzeReportFunction({
      data,
      language,
    });

    return result.data.text;
  } catch (error: any) {
    console.error("Error calling analyzeReport function:", error);
    
    // Handle specific error cases
    if (error.code === "unauthenticated") {
      return "Error: You must be signed in to use AI insights.";
    }
    
    if (error.code === "permission-denied") {
      return "Error: You don't have permission to use this feature.";
    }
    
    // Generic error message
    return "An error occurred while communicating with the AI service. Please try again.";
  }
};
