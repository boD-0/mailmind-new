export interface VersionEntry {
  id: string;
  shortHash: string;
  author: string;         // "Copywriter" | "Strategist" | "User Edit"
  description: string;
  content: string;
  timestamp: number;
  branch?: "ai" | "user"; // visual branch indicator
  parentHash?: string;
}
