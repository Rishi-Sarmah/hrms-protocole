import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Session, SessionListItem } from "../types/session";
import type { AppData } from "../types/budget";

const SESSIONS_COLLECTION = "sessions";

/**
 * Save a new session or update an existing one
 */
export async function saveSession(
  userId: string,
  sessionName: string,
  data: AppData,
  startDate: Date,
  endDate: Date,
  description?: string,
  sessionId?: string,
): Promise<string> {
  try {
    const now = new Date().toISOString();
    const sessionData: Session = {
      id: sessionId || doc(collection(db, SESSIONS_COLLECTION)).id,
      userId,
      sessionName,
      description: description || "",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      createdAt: sessionId
        ? (await getDoc(doc(db, SESSIONS_COLLECTION, sessionId))).data()
            ?.createdAt
        : now,
      updatedAt: now,
      data: {
        personnel: data.personnel,
        managementCount: data.managementCount,
        salaryMassCDF: data.salaryMassCDF,
        exploitation: data.exploitation,
        budget: data.budget,
      },
    };

    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionData.id);
    await setDoc(sessionRef, sessionData, { merge: true });

    return sessionData.id;
  } catch (error) {
    console.error("Error saving session:", error);
    throw new Error("Failed to save session to Firestore");
  }
}

/**
 * Get a specific session by ID
 */
export async function getSession(sessionId: string): Promise<Session | null> {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      return null;
    }

    return sessionDoc.data() as Session;
  } catch (error) {
    console.error("Error fetching session:", error);
    throw new Error("Failed to fetch session from Firestore");
  }
}

/**
 * Get all sessions for a specific user
 */
export async function getUserSessions(
  userId: string,
): Promise<SessionListItem[]> {
  try {
    const q = query(
      collection(db, SESSIONS_COLLECTION),
      where("userId", "==", userId),
    );

    const querySnapshot = await getDocs(q);
    const sessions: SessionListItem[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Session;
      sessions.push({
        id: data.id,
        sessionName: data.sessionName,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    // Sort by updatedAt in descending order (most recent first)
    sessions.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    return sessions;
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    throw new Error("Failed to fetch sessions from Firestore");
  }
}

/**
 * Update a session
 */
export async function updateSession(
  sessionId: string,
  updates: Partial<Omit<Session, "id" | "userId" | "createdAt">>,
): Promise<void> {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating session:", error);
    throw new Error("Failed to update session in Firestore");
  }
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await deleteDoc(sessionRef);
  } catch (error) {
    console.error("Error deleting session:", error);
    throw new Error("Failed to delete session from Firestore");
  }
}

/**
 * Duplicate a session with a new name
 */
export async function duplicateSession(
  sessionId: string,
  newSessionName: string,
  userId: string,
): Promise<string> {
  try {
    const originalSession = await getSession(sessionId);

    if (!originalSession || originalSession.userId !== userId) {
      throw new Error("Session not found or unauthorized");
    }

    const newId = await saveSession(
      userId,
      newSessionName,
      {
        personnel: originalSession.data.personnel,
        managementCount: originalSession.data.managementCount,
        salaryMassCDF: originalSession.data.salaryMassCDF,
        movements: [],
        workforce: [],
        serviceMissions: {
          performed: { type: "performed", count: 0, cost: 0 },
          received: { type: "received", count: 0, cost: 0 },
        },
        medicalCare: [],
        transfersKinshasa: [],
        transfersAbroad: [],
        missionCosts: {
          inside: { usd: 0, cdf: 0 },
          abroad: { usd: 0, cdf: 0 },
        },
        divers: [],
        exploitation: originalSession.data.exploitation,
        budget: originalSession.data.budget,
      },
      new Date(originalSession.startDate),
      new Date(originalSession.endDate),
      originalSession.description,
    );

    return newId;
  } catch (error) {
    console.error("Error duplicating session:", error);
    throw new Error("Failed to duplicate session");
  }
}
