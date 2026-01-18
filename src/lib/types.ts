export interface AgentStats {
  totalPRs: number;
  readyPRs: number;
  mergedPRs: number;
  successRate: number;
  totalCommits: number;
}

export interface ReviewStats {
  totalReviews: number;
  last7Days: number;
  trend: number;
}

export interface ContributionAgent {
  id: string;
  name: string;
  color: string;
  prQuery: string;
  commitQuery: string;
  stats: AgentStats;
}

export interface ReviewAgent {
  id: string;
  name: string;
  color: string;
  query: string;
  stats: ReviewStats;
}

export interface ContributionsData {
  lastUpdated: string;
  agents: ContributionAgent[];
}

export interface ReviewsData {
  lastUpdated: string;
  agents: ReviewAgent[];
}

export interface HistoryEntry {
  date: string;
  contributions: Record<string, { prs: number; merged: number; commits?: number }>;
  reviews: Record<string, { count: number }>;
}

export type SortField = 'totalPRs' | 'readyPRs' | 'mergedPRs' | 'successRate';
export type SortDirection = 'asc' | 'desc';
export type TimeRange = '7d' | '30d' | '90d' | '365d' | 'all';
export type ViewMode = 'contributions' | 'reviews';
