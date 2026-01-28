<div align="center">

```
 ██████╗ ███████╗███████╗     █████╗ ██████╗ ███████╗███╗   ██╗ █████╗
██╔═══██╗██╔════╝██╔════╝    ██╔══██╗██╔══██╗██╔════╝████╗  ██║██╔══██╗
██║   ██║███████╗███████╗    ███████║██████╔╝█████╗  ██╔██╗ ██║███████║
██║   ██║╚════██║╚════██║    ██╔══██║██╔══██╗██╔══╝  ██║╚██╗██║██╔══██║
╚██████╔╝███████║███████║    ██║  ██║██║  ██║███████╗██║ ╚████║██║  ██║
 ╚═════╝ ╚══════╝╚══════╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝
```

**Tracking open-source contributions by AI coding agents**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[View Live](https://oss-arena.vercel.app) | [Report Bug](https://github.com/auchenberg/oss-arena/issues) | [Request Feature](https://github.com/auchenberg/oss-arena/issues)

</div>

---

**Open Source Arena** tracks which AI coding agents are contributing to open source. We monitor pull requests, commits, code reviews, and merge rates across GitHub to see which AI tools are creating the most PRs, getting merged, and reviewing code.

## Features

- 📊 **Contributions Leaderboard** — Track PRs, commits, and merge success rates
- 🔍 **Code Reviews Tracking** — Monitor AI review bots and their activity
- 📈 **Historical Trends** — Visualize rankings over time with interactive charts
- 🔗 **GitHub Integration** — Direct links to verify all metrics
- ⚡ **Real-time Updates** — Automated data collection every 6 hours

### Tracked Contribution Agents

| Agent              | Color     | Detection Method            |
| ------------------ | --------- | --------------------------- |
| **GitHub Copilot** | 🟣 Purple | Branch prefix, bot username |
| **Cursor**         | 🔵 Teal   | Branch prefix, co-author    |
| **Claude Code**    | 🟠 Amber  | Co-author email             |
| **Devin**          | 🔴 Red    | Bot username                |
| **OpenAI Codex**   | 🟢 Green  | Branch prefix               |
| **Jules**          | 🔵 Blue   | Bot username                |
| **Codegen**        | 🟣 Purple | Bot username                |

### Tracked Code Review Bots

| Bot              | Specialty                   |
| ---------------- | --------------------------- |
| **CodeRabbit**   | AI-powered code reviews     |
| **Ellipsis**     | Automated PR analysis       |
| **Sourcery**     | Code quality suggestions    |
| **Greptile**     | Semantic code understanding |
| **Qodo**         | Test generation & reviews   |
| **Mesa**         | Security-focused reviews    |
| **Vercel Agent** | Deployment previews         |

---

## Quick Start

```
git clone https://github.com/auchenberg/oss-arena
cd oss-arena
npm install
npm run dev

🚀 Open http://localhost:3000
```

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/auchenberg/oss-arena.git

# Navigate to project directory
cd oss-arena

# Install dependencies
npm install

# Start development server
npm run dev
```

### Data Collection

To fetch fresh data from GitHub:

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_token_here

# Run the collection script
npm run collect-data
```

---

## Project Structure

```
    oss-arena/
    │
    ├── 📁 src/
    │   ├── 📁 app/                    # Next.js App Router
    │   │   ├── 📄 page.tsx            # Contributions page
    │   │   ├── 📁 code-reviews/       # Reviews leaderboard
    │   │   └── 📄 layout.tsx          # Root layout
    │   │
    │   ├── 📁 components/             # React components
    │   │   ├── 📄 Header.tsx          # Navigation
    │   │   ├── 📄 Leaderboard.tsx     # Main rankings
    │   │   ├── 📄 TrendChart.tsx      # Visualizations
    │   │   └── 📄 ...
    │   │
    │   ├── 📁 config/
    │   │   └── 📄 agents.ts           # Agent definitions
    │   │
    │   └── 📁 lib/
    │       ├── 📄 types.ts            # TypeScript types
    │       └── 📄 data.ts             # Data utilities
    │
    ├── 📁 scripts/
    │   └── 📄 collect-data.ts         # GitHub data fetcher
    │
    ├── 📁 data/
    │   ├── 📄 contributions.json      # Latest contributions
    │   ├── 📄 reviews.json            # Latest reviews
    │   └── 📁 history/                # Historical snapshots
    │
    └── 📄 package.json
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA COLLECTION                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────┐    Search API    ┌──────────────────┐    Query PRs, Commits
│             │ ◄──────────────► │                  │    & Reviews by Agent
│   GitHub    │                  │  collect-data.ts │──────────────────────┐
│             │ ◄──────────────► │                  │                      │
└─────────────┘   Rate Limited   └──────────────────┘                      │
                                          │                                │
                                          ▼                                │
                              ┌─────────────────────┐                      │
                              │   Detection Rules   │◄─────────────────────┘
                              │  ┌───────────────┐  │
                              │  │ Branch Prefix │  │  copilot/, cursor/
                              │  │ Bot Username  │  │  devin-ai[bot]
                              │  │ Co-Author     │  │  noreply@anthropic.com
                              │  └───────────────┘  │
                              └─────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               DATA STORAGE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   data/                                                                     │
│   ├── contributions.json      Current contribution stats                   │
│   ├── reviews.json            Current review stats                         │
│   └── history/                                                              │
│       ├── 2024-01-01.json     Daily snapshots for                          │
│       ├── 2024-01-02.json     trend analysis                               │
│       └── ...                                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│   │   Leaderboard   │    │  TrendChart     │    │ ReviewsBoard    │        │
│   │                 │    │                 │    │                 │        │
│   │  Rankings by    │    │  Historical     │    │  Code review    │        │
│   │  Total Work     │    │  data viz       │    │  bot activity   │        │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│            │                      │                      │                  │
│            └──────────────────────┴──────────────────────┘                  │
│                                   │                                         │
│                                   ▼                                         │
│                        ┌─────────────────┐                                  │
│                        │    Next.js      │                                  │
│                        │    Vercel       │                                  │
│                        └─────────────────┘                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

---

## Contributing

```
         _______________________________________________
        |                                               |
        |   We welcome contributions!                   |
        |                                               |
        |   1. Fork the repository                      |
        |   2. Create your feature branch               |
        |   3. Commit your changes                      |
        |   4. Push to the branch                       |
        |   5. Open a Pull Request                      |
        |_______________________________________________|
                       \   ^__^
                        \  (oo)\_______
                           (__)\       )\/\
                               ||----w |
                               ||     ||
```

### Adding a New Agent

Edit `src/config/agents.ts` to add detection rules:

```typescript
{
  name: 'New Agent',
  slug: 'new-agent',
  color: '#hexcolor',
  detectionRules: {
    branchPrefixes: ['new-agent/'],
    botUsernames: ['new-agent[bot]'],
    coAuthorEmails: ['agent@example.com']
  }
}
```

---

## Metrics Explained

| Metric             | Description                   |
| ------------------ | ----------------------------- |
| **Total Work**     | PRs + Commits combined        |
| **Total PRs**      | All pull requests created     |
| **Merged PRs**     | Successfully merged PRs       |
| **Ready PRs**      | Non-draft, open PRs           |
| **Success Rate**   | Merged / Total PRs percentage |
| **7-Day Activity** | Reviews in the last week      |
| **Trend**          | Week-over-week change         |

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---
