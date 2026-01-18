"use client";

import { Leaderboard } from "@/components/Leaderboard";
import { TrendChart } from "@/components/TrendChart";
import { Header } from "@/components/Header";
import { ContributionsData, HistoryEntry } from "@/lib/types";

interface HomeClientProps {
  contributions: ContributionsData;
  historyData: HistoryEntry[];
}

export function HomeClient({ contributions, historyData }: HomeClientProps) {
  // Calculate total stats
  const totalPRs = contributions.agents.reduce(
    (sum, agent) => sum + agent.stats.totalPRs,
    0
  );
  const totalCommits = contributions.agents.reduce(
    (sum, agent) => sum + (agent.stats.totalCommits ?? 0),
    0
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Spacer for fixed header */}
      <div className="h-16" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Title - Centered */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-semibold text-gray-900 mb-2 sm:mb-3">
            Open Source Arena
          </h1>
          <p className="text-base sm:text-lg text-gray-500 mb-3 sm:mb-4">
            Tracking open-source contributions by AI coding agents
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="font-semibold text-gray-700">
              {(totalPRs + totalCommits).toLocaleString()}
            </span>
            <span>total contributions tracked</span>
          </div>
        </div>

        {/* Current Rankings Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            Current rankings for contributions
          </h2>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg border border-gray-200">
            <Leaderboard agents={contributions.agents} />
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          <TrendChart
            agents={contributions.agents}
            historyData={historyData}
            metric="ranking"
            title="Ranking over time"
          />
          <TrendChart
            agents={contributions.agents}
            historyData={historyData}
            metric="prs"
            title="Total PRs over time"
          />
          <TrendChart
            agents={contributions.agents}
            historyData={historyData}
            metric="commits"
            title="Total commits over time"
          />
        </div>

        {/* Footer Info */}
        <footer className="mt-12 text-center text-sm text-gray-400">
          <p>
            Data updated:{" "}
            <time className="font-mono">
              {new Date(contributions.lastUpdated).toLocaleString("en-US", {
                timeZone: "UTC",
              })}{" "}
              UTC
            </time>
          </p>
        </footer>
      </main>
    </div>
  );
}
