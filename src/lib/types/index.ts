import type { User, Project, SwarmExecution, VaultDocument } from "@/db/schema";

export type { User, Project, SwarmExecution, VaultDocument };

export interface UserSession {
  user: User;
  sessionToken: string;
  expiresAt: Date;
}

export interface SwarmRequest {
  projectId: string;
  selectedAgents: ("COPYWRITER" | "RESEARCHER" | "STRATEGIST" | "ANALYST")[];
  prompt: string;
}

export interface SwarmResponse {
  results: {
    agentId: string;
    agentName: string;
    output: string;
  }[];
  totalTokens: number;
  durationMs: number;
}

export interface UploadRequest {
  fileName: string;
  mimeType: string;
  fileSize: number;
  projectId?: string;
}
