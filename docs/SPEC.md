# OSS Arena - Implementation Plan

## Project Overview
OSS Arena is an analytics platform tracking open-source contributions by AI Agents. It analyzes commits, pull requests, and **code reviews** to show how different AI tools are contributing to open source code.

## Design Inspiration
- **PR Arena (prarena.ai)**: Visual design template - clean leaderboard with sortable columns, toggle between metrics, interactive trend charts
- **AI Tool Tracker (aitooltracker.dev)**: AI code review tracking, 7-day rolling window charts, time range toggles, light/dark mode

## Requirements Summary
- **Data Scope**: Public GitHub repositories (via GitHub Search API)
- **AI Agents**: Configurable (start with major agents, expandable)
- **Tech Stack**: Next.js + TypeScript
- **Data Pipeline**: GitHub Actions (scheduled, commits data files to repo)
- **Detection**: Branch prefixes, bot accounts, commit signatures
- **Metrics**: PR metrics + code-level analysis + **code reviews**
- **Features**: Leaderboard with charts, export capabilities
- **Infrastructure**: Vercel (static hosting) - **NO DATABASE**

## Simplified Architecture (PR Arena Style)
**Key Insight**: Store all data as JSON/CSV files in the repo. GitHub Actions runs daily to update data, commits changes, which triggers Vercel redeploy. No database needed!

## Two Core Sections
1. **Code Contributions Leaderboard** - Which AI agents are contributing the most code (PRs, commits, lines)
2. **Code Reviews Section** - Which AI agents are reviewing the most PRs (review counts, comments)

## Reference Implementations (Open Source)

### PR Arena (github.com/aavetis/PRarena)
- **Tech**: Python scripts + CSV storage + GitHub Actions
- **Detection**: Branch prefixes (`head:copilot/`, `head:cursor/`) and bot author IDs
- **Data**: GitHub Search API, updates every 3 hours
- **Metrics**: Ready PRs, Merged PRs, Success Rate

### AI Tool Tracker (github.com/nsbradford/ai-devtool-leaderboard)
- **Tech**: Next.js + Tailwind + Neon PostgreSQL + Trigger.dev
- **Detection**: Bot account IDs for PR Review events (stored in `devtools.json`)
- **Data**: Google BigQuery (GH Archive) → PostgreSQL, daily updates
- **Metrics**: PR reviews by AI bots, 7-day rolling window

---

## Architecture Overview (Simplified - No Database)

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions (Scheduled)                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  1. Query GitHub Search API for each agent                 │ │
│  │  2. Aggregate stats (PRs, merges, reviews)                 │ │
│  │  3. Write to data/*.json files                             │ │
│  │  4. Git commit & push                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (triggers redeploy)
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel (Static)                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Next.js App                                               │ │
│  │  - Imports data/*.json at build time                       │ │
│  │  - Static pages with client-side interactivity             │ │
│  │  - No API routes needed                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Data Files (in repo):
├── data/
│   ├── agents.json          # Agent config & detection patterns
│   ├── contributions.json   # Current PR stats per agent
│   ├── reviews.json         # Current review stats per agent
│   └── history/
│       ├── 2025-01-15.json  # Daily snapshots for charts
│       ├── 2025-01-14.json
│       └── ...
```

---

## Phase 1: Project Foundation

### 1.1 Project Setup
- Initialize Next.js 14+ with App Router
- Configure TypeScript with strict mode
- Set up ESLint and Prettier
- Initialize Tailwind CSS
- Set up project structure:
  ```
  swe-arena/
  ├── src/
  │   ├── app/                    # Next.js App Router pages
  │   │   └── page.tsx            # Single page app (leaderboard + charts)
  │   ├── components/             # React components
  │   │   ├── Leaderboard.tsx
  │   │   ├── TrendChart.tsx
  │   │   ├── TabNavigation.tsx
  │   │   └── ThemeToggle.tsx
  │   ├── lib/                    # Shared utilities
  │   │   └── types.ts            # TypeScript types
  │   └── config/
  │       └── agents.ts           # Agent configuration
  ├── data/                       # JSON data files (updated by GitHub Actions)
  │   ├── contributions.json      # Current PR stats
  │   ├── reviews.json            # Current review stats
  │   └── history/                # Daily snapshots for charts
  │       └── YYYY-MM-DD.json
  ├── scripts/                    # Data collection scripts
  │   └── collect-data.ts         # Runs via GitHub Actions
  └── .github/
      └── workflows/
          └── update-data.yml     # Scheduled data collection
  ```

### 1.2 Data File Schemas (JSON)

**data/contributions.json** - Current PR contribution stats:
```json
{
  "lastUpdated": "2025-01-15T05:00:00Z",
  "agents": [
    {
      "id": "copilot",
      "name": "GitHub Copilot",
      "color": "#6e40c9",
      "stats": {
        "totalPRs": 624668,
        "readyPRs": 620000,
        "mergedPRs": 595062,
        "successRate": 95.19,
        "linesAdded": 12300000,
        "linesDeleted": 4500000
      }
    }
  ]
}
```

**data/reviews.json** - Current code review stats:
```json
{
  "lastUpdated": "2025-01-15T05:00:00Z",
  "agents": [
    {
      "id": "coderabbit",
      "name": "CodeRabbit",
      "color": "#f97316",
      "stats": {
        "totalReviews": 45231,
        "last7Days": 8234,
        "trend": 12.5
      }
    }
  ]
}
```

**data/history/YYYY-MM-DD.json** - Daily snapshots for trend charts:
```json
{
  "date": "2025-01-15",
  "contributions": {
    "copilot": { "prs": 1250, "merged": 1190 },
    "cursor": { "prs": 450, "merged": 432 }
  },
  "reviews": {
    "coderabbit": { "count": 1180 },
    "ellipsis": { "count": 320 }
  }
}
```

---

## Phase 2: AI Agent Detection System

### 2.1 Agent Configuration (JSON file for easy updates)
```json
// src/config/agents.json
{
  "agents": [
    {
      "id": "copilot",
      "name": "GitHub Copilot",
      "color": "#6e40c9",
      "detection": {
        "branchPrefixes": ["copilot/"],
        "coAuthorEmails": ["copilot@github.com"]
      }
    },
    {
      "id": "cursor",
      "name": "Cursor",
      "color": "#00d4aa",
      "detection": {
        "branchPrefixes": ["cursor/"]
      }
    },
    {
      "id": "codex",
      "name": "OpenAI Codex",
      "color": "#10a37f",
      "detection": {
        "branchPrefixes": ["codex/"],
        "botUsernames": ["openai-codex"]
      }
    },
    {
      "id": "devin",
      "name": "Devin",
      "color": "#ff6b6b",
      "detection": {
        "botUsernames": ["devin-ai-integration[bot]"],
        "botIds": [185860055]
      }
    },
    {
      "id": "claude",
      "name": "Claude",
      "color": "#d97706",
      "detection": {
        "coAuthorEmails": ["noreply@anthropic.com"],
        "commitPatterns": ["Generated with Claude", "Co-Authored-By:.*Claude"]
      }
    },
    {
      "id": "jules",
      "name": "Jules",
      "color": "#4285f4",
      "detection": {
        "botUsernames": ["jules-google[bot]"]
      }
    },
    {
      "id": "codegen",
      "name": "Codegen",
      "color": "#9333ea",
      "detection": {
        "botUsernames": ["codegen-sh[bot]"]
      }
    },
    {
      "id": "coderabbit",
      "name": "CodeRabbit",
      "color": "#f97316",
      "detection": {
        "botUsernames": ["coderabbitai[bot]"],
        "botIds": [136622811]
      },
      "reviewsOnly": true
    },
    {
      "id": "ellipsis",
      "name": "Ellipsis",
      "color": "#06b6d4",
      "detection": {
        "botUsernames": ["ellipsis-dev[bot]"],
        "botIds": [147648171]
      },
      "reviewsOnly": true
    }
  ]
}
```

### 2.2 Detection Methods (matching reference implementations)

**For PR Contributions (like PR Arena):**
1. **Branch prefix matching**: Search GitHub with `head:copilot/`, `head:cursor/`, etc.
2. **Bot author detection**: PRs created by bot accounts
3. **Co-authored-by headers**: Parse commit messages for AI co-author signatures

**For Code Reviews (like AI Tool Tracker):**
1. **Bot ID matching**: Track PR Review events from known bot user IDs
2. **Only PR Reviews**: Exclude issue comments to avoid false positives

### 2.3 Detection Service
```typescript
// src/lib/detection/detector.ts
export class AIContributionDetector {
  constructor(private agents: AgentConfig[]) {}

  // Detect from PR branch name
  detectFromBranch(headRef: string): string | null;

  // Detect from PR author (bot accounts)
  detectFromAuthor(username: string, userId: number): string | null;

  // Detect from commit message (co-authored-by)
  detectFromCommit(message: string): string | null;

  // Detect code review bot
  detectReviewer(username: string, userId: number): string | null;
}
```

---

## Phase 3: Data Collection (GitHub Actions)

### 3.1 Data Collection Script
```typescript
// scripts/collect-data.ts
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Agent detection queries (like PR Arena)
const agents = [
  { id: 'copilot', query: 'head:copilot/' },
  { id: 'cursor', query: 'head:cursor/' },
  { id: 'codex', query: 'head:codex/' },
  { id: 'devin', query: 'author:devin-ai-integration[bot]' },
  { id: 'jules', query: 'author:jules-google[bot]' },
];

async function collectContributions() {
  const results = [];

  for (const agent of agents) {
    // Search for PRs
    const { data: allPRs } = await octokit.search.issuesAndPullRequests({
      q: `is:pr ${agent.query}`,
      per_page: 1,
    });

    const { data: mergedPRs } = await octokit.search.issuesAndPullRequests({
      q: `is:pr is:merged ${agent.query}`,
      per_page: 1,
    });

    const { data: readyPRs } = await octokit.search.issuesAndPullRequests({
      q: `is:pr -is:draft ${agent.query}`,
      per_page: 1,
    });

    results.push({
      id: agent.id,
      totalPRs: allPRs.total_count,
      readyPRs: readyPRs.total_count,
      mergedPRs: mergedPRs.total_count,
      successRate: (mergedPRs.total_count / readyPRs.total_count * 100).toFixed(2),
    });
  }

  return results;
}
```

### 3.2 GitHub Actions Workflow
```yaml
# .github/workflows/update-data.yml
name: Update Data

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:        # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci

      - name: Collect data
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx tsx scripts/collect-data.ts

      - name: Commit and push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/
          git diff --staged --quiet || git commit -m "Update data $(date -u +%Y-%m-%dT%H:%M:%SZ)"
          git push
```

### 3.3 Rate Limiting Considerations
- GitHub Search API: 30 requests/minute (authenticated)
- Add delays between agent queries
- Use search `total_count` instead of paginating all results
- Consider caching to reduce API calls

---

## Phase 4: Frontend Data Loading

### 4.1 Static Data Import (at build time)
```typescript
// src/app/page.tsx
import contributionsData from '../../data/contributions.json';
import reviewsData from '../../data/reviews.json';

// For history, dynamically import based on date range
import { getHistoryData } from '@/lib/data';

export default function Home() {
  return (
    <main>
      <TabNavigation />
      <Leaderboard data={contributionsData} />
      <TrendChart history={getHistoryData(90)} />
    </main>
  );
}
```

### 4.2 Client-Side Filtering
All filtering (time range, sort order, view mode) happens client-side since data is static and relatively small.

---

## Phase 5: Frontend Implementation (PR Arena Style)

### 5.1 Page Layout (Single Page App like PR Arena)

```
┌────────────────────────────────────────────────────────────────┐
│  OSS Arena                                    [Theme Toggle]   │
│  Tracking open-source contributions by AI Agents               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [Code Contributions] [Code Reviews]  ← Tab Navigation         │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                    LEADERBOARD TABLE                           │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Sort: [PRs ▼] [Merged ▼] [Success Rate ▼] [Lines ▼]   │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ Rank │ Agent    │ Ready PRs │ Merged │ Rate  │ Lines  │   │
│  │  1   │ Copilot  │ 624,668   │595,062 │ 95.2% │ 12.3M  │   │
│  │  2   │ Codex    │ 2,811,010 │2,454K  │ 87.3% │ 45.1M  │   │
│  │  3   │ Cursor   │ 157,683   │151,468 │ 96.1% │  3.2M  │   │
│  │  ...                                                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                    TREND CHARTS                                │
│  Time range: [7d] [30d] [90d] [365d] [All]                    │
│  View: [Volume] [Success Rate] [Both]                          │
│  Scale: [Linear] [Log]                                         │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         Interactive line chart (Recharts)              │   │
│  │         - PRs created over time                        │   │
│  │         - Color-coded by agent                         │   │
│  │         - Hover tooltips                               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Data updated daily · Source: GitHub Archive                   │
│  Created by [Your Name] · [GitHub]                             │
└────────────────────────────────────────────────────────────────┘
```

### 5.2 Code Reviews Section (AI Tool Tracker Style)

When "Code Reviews" tab is selected:
```
┌────────────────────────────────────────────────────────────────┐
│  AI Code Review Adoption                                       │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         7-day rolling window chart                     │   │
│  │         - Reviews per day by bot                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  Current Rankings (Last 7 Days)                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Rank │ Bot          │ Reviews │ Trend                  │   │
│  │  1   │ CodeRabbit   │ 45,231  │ ↑ 12%                  │   │
│  │  2   │ Ellipsis     │ 12,456  │ ↑ 8%                   │   │
│  │  ...                                                   │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### 5.3 Key UI Components

```typescript
// Components matching PR Arena design
<ThemeToggle />           // Light/dark mode (system preference)
<TabNavigation />         // Code Contributions | Code Reviews
<LeaderboardTable />      // Sortable, ranked table
<TimeRangeSelector />     // 7d, 30d, 90d, 365d, All
<ViewToggle />            // Volume | Success Rate | Both
<ScaleToggle />           // Linear | Log
<TrendChart />            // Multi-line chart with agent colors
<AgentLegend />           // Clickable legend to filter agents
```

### 5.4 Chart Library
**Recharts** (like AI Tool Tracker):
- Responsive container
- Line charts for trends
- Tooltips with date and values
- Configurable axis scales (linear/log)
- Legend with click-to-toggle

### 5.5 Styling
**Tailwind CSS** with:
- Dark mode support (`dark:` variants)
- Clean, minimal design
- Monospace numbers for data
- Agent colors from config

---

## Phase 6: Export & Polish

### 6.1 Export Capabilities
- Download current data as CSV (client-side generation)
- Link to raw JSON files in repo
- "Last updated" timestamp in footer

### 6.2 Additional Polish
- Loading states
- Error boundaries
- SEO meta tags
- Open Graph images for social sharing

---

## Implementation Order

1. **Project Setup** (Phase 1)
   - Next.js + Tailwind + TypeScript
   - Basic file structure

2. **Data Collection Script** (Phase 3)
   - GitHub API queries
   - JSON file generation
   - GitHub Actions workflow

3. **Frontend MVP** (Phase 5)
   - Leaderboard table
   - Basic sorting

4. **Charts & Interactivity** (Phase 5)
   - Trend charts with Recharts
   - Time range selector
   - Tab navigation (Contributions / Reviews)

5. **Polish** (Phase 6)
   - Dark mode
   - Export
   - SEO

---

## Key Technical Decisions

### No Database
- Data stored as JSON files in repo
- GitHub Actions updates files on schedule
- Vercel auto-deploys on push
- Simple, free, no infrastructure to manage

### Rate Limiting Strategy
- GitHub Search API: 30 requests/minute (authenticated)
- Query only `total_count` (no pagination needed)
- Add 2-second delays between queries
- Run collection every 6 hours (ample margin)

### Detection Methods (from reference implementations)
- **Branch prefixes**: `head:copilot/`, `head:cursor/`, `head:codex/`
- **Bot authors**: `author:devin-ai-integration[bot]`
- **Future**: Co-authored-by patterns, commit message patterns

---

## Environment Variables
```env
# For GitHub Actions only
GITHUB_TOKEN=  # Automatically provided by GitHub Actions

# Optional: for local development
GITHUB_PAT=    # Personal access token for testing scripts
```

---

## Initial AI Agents to Track

**Code Contributors:**
1. GitHub Copilot (branch: `copilot/`)
2. Cursor (branch: `cursor/`)
3. OpenAI Codex (branch: `codex/`)
4. Devin (author: `devin-ai-integration[bot]`)
5. Jules (author: `jules-google[bot]`)
6. Codegen (author: `codegen-sh[bot]`)

**Code Reviewers:**
1. CodeRabbit (`coderabbitai[bot]`)
2. Ellipsis (`ellipsis-dev[bot]`)
3. Sourcery (`sourcery-ai[bot]`)

These can be extended by adding entries to `src/config/agents.ts`.
