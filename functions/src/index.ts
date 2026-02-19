import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";
import { serializeSession } from "./utils/serialize";

admin.initializeApp();
const db = admin.firestore();

// Define the Gemini API key as a Cloud Functions secret
const geminiApiKey = defineSecret("GEMINI_API_KEY");

// ─── Constants ───────────────────────────────────────────────────────────────

const SESSIONS_COLLECTION = "sessions";
const EMBEDDING_MODEL = "text-embedding-004";
const CHAT_MODEL = "gemini-2.0-flash";
const EMBEDDING_DIMENSIONS = 768;

// ─── Helper: Generate embedding for text ────────────────────────────────────

async function generateEmbedding(
  ai: GoogleGenAI,
  text: string
): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const embedding = response.embeddings?.[0]?.values;
  if (!embedding) {
    throw new Error("Failed to generate embedding — empty response");
  }
  return embedding;
}

// ─── 1. Embedding Generation Trigger ────────────────────────────────────────
//
// Fires when a session document is created or updated.
// Serializes the session data to text, generates a vector embedding,
// and writes it back to the document.

export const generateSessionEmbedding = onDocumentWritten(
  {
    document: `${SESSIONS_COLLECTION}/{sessionId}`,
    secrets: [geminiApiKey],
    memory: "512MiB",
    timeoutSeconds: 120,
  },
  async (event) => {
    const after = event.data?.after;
    if (!after?.exists) {
      // Document was deleted — nothing to do
      return;
    }

    const sessionData = after.data();
    if (!sessionData) return;

    // Prevent infinite loops: skip if only embedding fields changed
    const before = event.data?.before;
    if (before?.exists) {
      const beforeData = before.data();
      if (beforeData) {
        // Compare the data payload (excluding embedding fields)
        const { embedding: _bEmb, embeddingText: _bTxt, ...beforeRest } = beforeData;
        const { embedding: _aEmb, embeddingText: _aTxt, ...afterRest } = sessionData;
        if (JSON.stringify(beforeRest) === JSON.stringify(afterRest)) {
          // Only embedding fields changed — skip
          return;
        }
      }
    }

    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });
      const text = serializeSession(sessionData);

      if (!text || text.length < 20) {
        console.log(`Session ${event.params.sessionId}: insufficient data for embedding`);
        return;
      }

      const embeddingVector = await generateEmbedding(ai, text);

      // Write the embedding back using FieldValue.vector()
      await after.ref.update({
        embedding: admin.firestore.FieldValue.vector(embeddingVector),
        embeddingText: text,
      });

      console.log(
        `Session ${event.params.sessionId}: embedding generated (${embeddingVector.length} dims, text: ${text.length} chars)`
      );
    } catch (error) {
      console.error(`Session ${event.params.sessionId}: embedding generation failed`, error);
    }
  }
);

// ─── 2. Chat Callable Function ──────────────────────────────────────────────
//
// Receives a user question + conversation history.
// 1. Generates an embedding for the question
// 2. Runs findNearest() on sessions collection, pre-filtered by userId
// 3. Builds context from matched sessions
// 4. Sends to Gemini for answer generation
// 5. Returns the answer + source session references

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  question: string;
  history?: ChatMessage[];
  language?: string;
}

interface ChatResponse {
  answer: string;
  sources: { sessionId: string; sessionName: string }[];
}

export const chat = onCall<ChatRequest>(
  {
    secrets: [geminiApiKey],
    memory: "512MiB",
    timeoutSeconds: 120,
    enforceAppCheck: false,
  },
  async (request): Promise<ChatResponse> => {
    // Auth check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in to use the chat.");
    }

    const { question, history = [], language = "en" } = request.data;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      throw new HttpsError("invalid-argument", "A question is required.");
    }

    const userId = request.auth.uid;
    const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });

    // Step 1: Generate embedding for the user's question
    const queryEmbedding = await generateEmbedding(ai, question.trim());

    // Step 2: Vector similarity search with pre-filter on userId
    const sessionsRef = db.collection(SESSIONS_COLLECTION);
    const vectorQuery = sessionsRef
      .where("userId", "==", userId)
      .findNearest("embedding", admin.firestore.FieldValue.vector(queryEmbedding), {
        limit: 5,
        distanceMeasure: "COSINE",
      });

    const querySnapshot = await vectorQuery.get();

    if (querySnapshot.empty) {
      return {
        answer:
          language === "fr"
            ? "Je n'ai trouvé aucune session correspondant à votre question. Veuillez vous assurer que vous avez des sessions enregistrées avec des données."
            : "I couldn't find any sessions matching your question. Please make sure you have saved sessions with data.",
        sources: [],
      };
    }

    // Step 3: Build context from matched sessions
    const sources: { sessionId: string; sessionName: string }[] = [];
    const contextParts: string[] = [];

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      sources.push({
        sessionId: data.id || doc.id,
        sessionName: data.sessionName || "Unnamed",
      });
      // Use the pre-serialized embeddingText if available, otherwise serialize on-the-fly
      const text = data.embeddingText || serializeSession(data);
      contextParts.push(`--- Session: ${data.sessionName || "Unnamed"} (ID: ${doc.id}) ---\n${text}`);
    }

    const context = contextParts.join("\n\n");

    // Step 4: Build prompt with system instructions + context + history + question
    const systemPrompt = `You are an AI assistant for an administrative and operational reporting system (OCC — Office Congolais de Contrôle). You help users query and understand their session data which covers:
- Personnel/HR (staff counts by category/grade/gender, management cadre, salary mass)
- Budget (production forecast vs achievement, charges, treasury receipts/disbursements)
- Exploitation (import/export volumes and values, lab analysis compliance, metrology, technical control)

Rules:
1. Answer ONLY based on the provided session data context. Do not make up information.
2. If the context does not contain enough information to answer, say so explicitly.
3. When referencing data, cite which session it comes from by name.
4. Provide specific numbers and calculations when possible.
5. Respond in ${language === "fr" ? "French" : "English"}.
6. Be concise but thorough. Use bullet points for clarity when listing multiple data points.
7. If the user asks for comparisons between sessions, compare the relevant metrics side by side.`;

    // Build conversation for Gemini
    const conversationParts: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // System context as the first user message
    conversationParts.push({
      role: "user",
      parts: [
        {
          text: `${systemPrompt}\n\n--- CONTEXT DATA ---\n${context}\n--- END CONTEXT ---\n\nPlease acknowledge you have the context and are ready to answer questions.`,
        },
      ],
    });
    conversationParts.push({
      role: "model",
      parts: [
        {
          text:
            language === "fr"
              ? "J'ai bien reçu les données de contexte. Je suis prêt à répondre à vos questions sur vos sessions."
              : "I have received the context data. I'm ready to answer your questions about your sessions.",
        },
      ],
    });

    // Append conversation history
    for (const msg of history.slice(-10)) {
      conversationParts.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }

    // Append the current question
    conversationParts.push({
      role: "user",
      parts: [{ text: question }],
    });

    // Step 5: Generate answer
    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents: conversationParts,
    });

    const answer =
      response.text ||
      (language === "fr"
        ? "Désolé, je n'ai pas pu générer une réponse. Veuillez réessayer."
        : "Sorry, I couldn't generate a response. Please try again.");

    return { answer, sources };
  }
);

// ─── 3. Backfill Embeddings ─────────────────────────────────────────────────
//
// One-time HTTP endpoint to generate embeddings for all existing sessions.
// Trigger manually: POST /backfillEmbeddings
// Requires admin auth header for safety.

export const backfillEmbeddings = onRequest(
  {
    secrets: [geminiApiKey],
    memory: "1GiB",
    timeoutSeconds: 540,
  },
  async (req, res) => {
    // Simple auth check — require a specific header
    const authHeader = req.headers["x-admin-key"];
    if (authHeader !== geminiApiKey.value()) {
      res.status(403).send("Forbidden");
      return;
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });
    const sessionsRef = db.collection(SESSIONS_COLLECTION);
    const snapshot = await sessionsRef.get();

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Skip if already has embedding
      if (data.embedding && Array.isArray(data.embedding)) {
        skipped++;
        continue;
      }

      try {
        const text = serializeSession(data);
        if (!text || text.length < 20) {
          skipped++;
          continue;
        }

        const embeddingVector = await generateEmbedding(ai, text);

        await doc.ref.update({
          embedding: admin.firestore.FieldValue.vector(embeddingVector),
          embeddingText: text,
        });

        processed++;
        console.log(`Backfill: processed ${doc.id}`);

        // Rate limit: wait 200ms between calls to avoid quota issues
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        errors++;
        console.error(`Backfill: failed for ${doc.id}`, error);
      }
    }

    res.json({
      message: "Backfill complete",
      total: snapshot.size,
      processed,
      skipped,
      errors,
    });
  }
);
