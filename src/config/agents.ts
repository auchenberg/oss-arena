export interface AgentDetection {
  branchPrefixes?: string[];
  botUsernames?: string[];
  botIds?: number[];
  coAuthorEmails?: string[];
  commitPatterns?: string[];
  commitQuery?: string; // Query for searching commits directly
}

export interface AgentConfig {
  id: string;
  name: string;
  color: string;
  detection: AgentDetection;
  reviewsOnly?: boolean;
}

export const contributionAgents: AgentConfig[] = [
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    color: '#6e40c9',
    detection: {
      branchPrefixes: ['copilot/'],
      coAuthorEmails: ['copilot@github.com'],
    },
  },
  {
    id: 'cursor',
    name: 'Cursor',
    color: '#00d4aa',
    detection: {
      branchPrefixes: ['cursor/'],
    },
  },
  {
    id: 'codex',
    name: 'OpenAI Codex',
    color: '#10a37f',
    detection: {
      branchPrefixes: ['codex/'],
      botUsernames: ['openai-codex'],
    },
  },
  {
    id: 'devin',
    name: 'Devin',
    color: '#ff6b6b',
    detection: {
      botUsernames: ['devin-ai-integration[bot]'],
      botIds: [185860055],
    },
  },
  {
    id: 'claude',
    name: 'Claude Code',
    color: '#d97706',
    detection: {
      coAuthorEmails: ['noreply@anthropic.com'],
      commitPatterns: ['Generated with Claude', 'Co-Authored-By:.*Claude'],
    },
  },
  {
    id: 'jules',
    name: 'Jules',
    color: '#4285f4',
    detection: {
      botUsernames: ['jules-google[bot]'],
    },
  },
  {
    id: 'codegen',
    name: 'Codegen',
    color: '#9333ea',
    detection: {
      botUsernames: ['codegen-sh[bot]'],
    },
  },
];

export const reviewAgents: AgentConfig[] = [
  {
    id: 'coderabbit',
    name: 'CodeRabbit',
    color: '#f97316',
    detection: {
      botUsernames: ['coderabbitai[bot]'],
      botIds: [136622811],
    },
    reviewsOnly: true,
  },
  {
    id: 'ellipsis',
    name: 'Ellipsis',
    color: '#06b6d4',
    detection: {
      botUsernames: ['ellipsis-dev[bot]'],
      botIds: [147648171],
    },
    reviewsOnly: true,
  },
  {
    id: 'sourcery',
    name: 'Sourcery',
    color: '#ec4899',
    detection: {
      botUsernames: ['sourcery-ai[bot]'],
    },
    reviewsOnly: true,
  },
  {
    id: 'greptile',
    name: 'Greptile',
    color: '#22c55e',
    detection: {
      botUsernames: ['greptileai[bot]'],
    },
    reviewsOnly: true,
  },
  {
    id: 'qodo',
    name: 'Qodo',
    color: '#8b5cf6',
    detection: {
      botUsernames: ['qodo-merge-pro[bot]', 'qodo-merge-pro-for-open-source[bot]'],
    },
    reviewsOnly: true,
  },
  {
    id: 'mesa',
    name: 'Mesa',
    color: '#0ea5e9',
    detection: {
      botUsernames: ['mesa-dev[bot]'],
    },
    reviewsOnly: true,
  },
  {
    id: 'vercel',
    name: 'Vercel Agent',
    color: '#000000',
    detection: {
      botUsernames: ['vercel-agent[bot]'],
    },
    reviewsOnly: true,
  },
];

export const allAgents = [...contributionAgents, ...reviewAgents];

// Helper to get query for GitHub Search API
export function getSearchQuery(agent: AgentConfig): string | null {
  const { detection } = agent;

  // Prefer branch prefix detection (most reliable)
  if (detection.branchPrefixes?.length) {
    return `head:${detection.branchPrefixes[0]}`;
  }

  // Fall back to bot author detection
  if (detection.botUsernames?.length) {
    return `author:${detection.botUsernames[0]}`;
  }

  return null;
}
