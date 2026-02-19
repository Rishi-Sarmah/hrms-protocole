import type { AppData } from "./budget";

export interface Session {
  id: string;
  userId: string; // Firebase Auth UID
  sessionName: string;
  description?: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  data: {
    staff: AppData["staff"];
    managementCount: AppData["managementCount"];
    salaryMassCDF: AppData["salaryMassCDF"];
    exploitation: AppData["exploitation"];
    budget: AppData["budget"];
  };
  // Vector embedding fields (managed by Cloud Functions — not set client-side)
  embeddingText?: string;
}

export interface SessionListItem {
  id: string;
  sessionName: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}
