import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  translations?: { en: string; fr: string };
  sources?: { sessionId: string; sessionName: string }[];
  timestamp: string;
}

interface ChatRequest {
  question: string;
  history: { role: "user" | "assistant"; content: string }[];
  language: string;
}

interface ChatResponse {
  answer: string;
  sources: { sessionId: string; sessionName: string }[];
}

// ─── Cloud Function callable reference ──────────────────────────────────────

const chatFunction = httpsCallable<ChatRequest, ChatResponse>(functions, "chat");

// ─── Service ────────────────────────────────────────────────────────────────

/**
 * Sends a chat question to the Cloud Function and returns the AI response.
 * Includes conversation history for multi-turn context.
 */
export async function sendChatMessage(
  question: string,
  history: ChatMessage[],
  language: string
): Promise<{ 
  answer: string; 
  sources: { sessionId: string; sessionName: string }[]; 
  translations?: { en: string; fr: string };
  questionTranslations?: { en: string; fr: string };
}> {
  // Convert ChatMessage[] to the simplified format expected by the Cloud Function
  const simplifiedHistory = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const result = await chatFunction({
    question,
    history: simplifiedHistory,
    language,
  });

  // Try parsing the answer as JSON
  let answer = result.data.answer;
  let translations: { en: string; fr: string } | undefined;
  let questionTranslations: { en: string; fr: string } | undefined;

  try {
    const parsed = JSON.parse(answer);
    
    // Check for new structure { answer: {...}, question: {...} }
    if (parsed.answer && parsed.question) {
      translations = parsed.answer;
      questionTranslations = parsed.question;
      answer = language.startsWith('fr') ? parsed.answer.fr : parsed.answer.en;
    } 
    // Fallback to old structure { en, fr }
    else if (parsed.en && parsed.fr) {
      translations = parsed;
      answer = language.startsWith('fr') ? parsed.fr : parsed.en;
    }
  } catch (e) {
    // Not JSON, use as plain text
  }

  return { 
    answer, 
    sources: result.data.sources, 
    translations,
    questionTranslations
  };
}

/**
 * Generate a unique ID for chat messages (client-side only)
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
