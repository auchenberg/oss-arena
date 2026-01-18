# OSS Arena

OSS Arena is an analytics platform tracking open-source contributions by AI coding agents. It analyzes commits, pull requests, and code reviews to show how different AI tools are contributing to open source.

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **Charts**: Recharts
- **Data**: JSON files in repo (no database)
- **Data Collection**: GitHub Search API via `@octokit/rest`
- **Hosting**: Vercel (static)
- **Updates**: GitHub Actions (scheduled)

## Design Inspiration

- **PR Arena (prarena.ai)**: Visual design template - clean leaderboard with sortable columns, toggle between metrics, interactive trend charts
- **AI Tool Tracker (aitooltracker.dev)**: AI code review tracking, 7-day rolling window charts, time range toggles

## Architecture

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
```

## Project Structure

```
oss-arena/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Main page (server component)
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── HomeClient.tsx      # Main client component
│   │   ├── Leaderboard.tsx     # Contributions leaderboard
│   │   ├── ReviewsLeaderboard.tsx
│   │   ├── TrendChart.tsx      # Recharts line charts
│   │   └── TabNavigation.tsx
│   └── lib/                    # Shared utilities
│       ├── types.ts            # TypeScript types
│       └── data.ts             # Data loading helpers
├── data/                       # JSON data files (updated by GitHub Actions)
│   ├── contributions.json      # Current PR stats
│   ├── reviews.json            # Current review stats
│   └── history/                # Daily snapshots for charts
│       └── YYYY-MM-DD.json
├── scripts/
│   └── collect-data.ts         # Data collection script
└── .github/
    └── workflows/
        └── update-data.yml     # Scheduled data collection
```

## Data Schemas

**data/contributions.json** - Current PR contribution stats:
```json
{
  "lastUpdated": "2026-01-16T03:31:44.993Z",
  "agents": [
    {
      "id": "copilot",
      "name": "GitHub Copilot",
      "color": "#6e40c9",
      "stats": {
        "totalPRs": 883564,
        "readyPRs": 625248,
        "mergedPRs": 595174,
        "successRate": 95.19,
        "totalCommits": 1624544
      }
    }
  ]
}
```

**data/reviews.json** - Current code review stats:
```json
{
  "lastUpdated": "2026-01-16T03:31:44.993Z",
  "agents": [
    {
      "id": "coderabbit",
      "name": "CodeRabbit",
      "color": "#f97316",
      "stats": {
        "totalReviews": 45231,
        "last7Days": 8234,
        "trend": 0
      }
    }
  ]
}
```

**data/history/YYYY-MM-DD.json** - Daily snapshots for trend charts:
```json
{
  "date": "2026-01-16",
  "contributions": {
    "copilot": { "prs": 883564, "merged": 595174, "commits": 1624544 },
    "cursor": { "prs": 268389, "merged": 151505, "commits": 53958 }
  },
  "reviews": {
    "coderabbit": { "count": 45231 },
    "ellipsis": { "count": 12456 }
  }
}
```

## AI Agents Tracked

### Code Contributors
| Agent | PR Detection | Commit Detection |
|-------|--------------|------------------|
| GitHub Copilot | `head:copilot/` branch | `copilot-swe-agent[bot]` |
| Cursor | `head:cursor/` branch | `"Co-authored-by: Cursor"` |
| OpenAI Codex | `head:codex/` branch | `"OpenAI Codex"` in message |
| Devin | `devin-ai-integration[bot]` | `devin-ai-integration[bot]` |
| Claude Code | `author:app/claude` | `"Generated with Claude Code"` |
| Jules | `google-labs-jules[bot]` | `google-labs-jules[bot]` |
| Codegen | `codegen-sh[bot]` | `codegen-sh[bot]` |
| Vercel | `vercel[bot]` | `vercel[bot]` |

### Code Reviewers
| Agent | Detection Method |
|-------|-----------------|
| CodeRabbit | `commenter:coderabbitai[bot]` |
| Ellipsis | `commenter:ellipsis-dev[bot]` |
| Sourcery | `commenter:sourcery-ai[bot]` |
| Greptile | `commenter:greptile-apps[bot]` |

## UI Layout

```
┌────────────────────────────────────────────────────────────────┐
│  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ (accent bar)     │
├────────────────────────────────────────────────────────────────┤
│  OSS Arena                                                      │
│  Tracking open-source contributions by AI Agents                │
│  A project by @auchenberg · Source: GitHub Search API · GitHub  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [Code Contributions] [Code Reviews]  ← Tab Navigation         │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                    LEADERBOARD TABLE                           │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ #1  OpenAI Codex     87.3%   21,896  2,821,154  2,463K │   │
│  │ #2  GitHub Copilot   95.2%  260,776    633,211    602K │   │
│  │ #3  Cursor           96.1%  110,937    158,131    151K │   │
│  │ ...                                                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                    TREND CHARTS                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         Ranking Over Time (line chart)                 │   │
│  └────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         Total PRs Over Time (line chart)               │   │
│  └────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         Total Commits Over Time (line chart)           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Data updated: 2026-01-16 03:31:44 UTC                         │
└────────────────────────────────────────────────────────────────┘
```

## Key Components

| Component | Purpose |
|-----------|---------|
| `HomeClient` | Main client component with state management |
| `TabNavigation` | Switch between Contributions / Reviews |
| `Leaderboard` | Sortable table for contribution stats |
| `ReviewsLeaderboard` | Table for review agent stats |
| `TrendChart` | Recharts line chart for historical data |

## Rate Limiting

- GitHub Search API: 30 requests/minute (authenticated)
- Script uses 3-second delays between queries
- Retry logic with exponential backoff for 403/429 errors
- Collection runs every 6 hours via GitHub Actions

## Running Locally

```bash
npm install
npm run dev
```

## Data Collection

```bash
GITHUB_TOKEN=your_token npx tsx scripts/collect-data.ts
```

## Environment Variables

```env
# For GitHub Actions (automatically provided)
GITHUB_TOKEN=

# For local development
GITHUB_TOKEN=your_personal_access_token
```

## GitHub Actions Workflow

The workflow at `.github/workflows/update-data.yml` runs on schedule to:
1. Query GitHub Search API for each agent
2. Update `data/*.json` files
3. Save daily history snapshot
4. Commit and push changes
5. Vercel auto-deploys on push
