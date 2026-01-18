"use client";

import { useState, useMemo } from "react";
import { ContributionAgent, SortDirection } from "@/lib/types";

interface LeaderboardProps {
  agents: ContributionAgent[];
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function formatCompact(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}K`;
  }
  return num.toLocaleString();
}

type SortField =
  | "totalPRs"
  | "mergedPRs"
  | "successRate"
  | "totalCommits"
  | "totalWork";

// Medal/rank display component
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="text-2xl" title="1st Place">
        🥇
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="text-2xl" title="2nd Place">
        🥈
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="text-2xl" title="3rd Place">
        🥉
      </span>
    );
  }
  return <span className="text-gray-400 font-medium">#{rank}</span>;
}

// Progress bar for success rate
function SuccessRateBar({
  rate,
  className = "",
}: {
  rate: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-end gap-1 ${className}`}>
      <span className="text-sm font-medium text-gray-900">
        {rate.toFixed(1)}%
      </span>
      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full"
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function Leaderboard({ agents }: LeaderboardProps) {
  const [sortField, setSortField] = useState<SortField>("totalWork");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      if (sortField === "totalWork") {
        aVal = a.stats.totalPRs + (a.stats.totalCommits ?? 0);
        bVal = b.stats.totalPRs + (b.stats.totalCommits ?? 0);
      } else {
        aVal = a.stats[sortField] ?? 0;
        bVal = b.stats[sortField] ?? 0;
      }
      return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [agents, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortHeader = ({
    field,
    label,
    align = "left",
  }: {
    field: SortField;
    label: string;
    align?: "left" | "right";
  }) => (
    <th
      className={`px-2 sm:px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors whitespace-nowrap ${
        align === "right" ? "text-right" : "text-left"
      }`}
      onClick={() => handleSort(field)}
    >
      <div
        className={`flex items-center gap-1 ${
          align === "right" ? "justify-end" : ""
        }`}
      >
        {label}
        {sortField === field ? (
          <span className="text-gray-600">
            {sortDirection === "desc" ? "↓" : "↑"}
          </span>
        ) : (
          <span className="text-gray-300">⇅</span>
        )}
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-left w-16 sm:w-20">
              Rank
            </th>
            <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-left">
              Agent
            </th>
            <SortHeader field="totalWork" label="Total Work" align="right" />
            <SortHeader field="totalPRs" label="Total PRs" align="right" />
            <SortHeader
              field="totalCommits"
              label="Total Commits"
              align="right"
            />
          </tr>
        </thead>
        <tbody>
          {sortedAgents.map((agent, index) => {
            const rank = index + 1;
            const totalWork =
              agent.stats.totalPRs + (agent.stats.totalCommits ?? 0);
            return (
              <tr
                key={agent.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                  <RankBadge rank={rank} />
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: agent.color }}
                    />
                    <span className="font-medium text-gray-900 text-sm sm:text-base">
                      {agent.name}
                    </span>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-right">
                  <span className="font-bold text-gray-900 text-sm sm:text-base">
                    {formatNumber(totalWork)}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-gray-600 text-sm sm:text-base">
                      {formatNumber(agent.stats.totalPRs)}
                    </span>
                    <a
                      href={`https://github.com/search?q=${encodeURIComponent(`is:pr ${agent.prQuery}`)}&type=pullrequests`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-gray-500 hidden sm:block"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-gray-600 text-sm sm:text-base">
                      {formatNumber(agent.stats.totalCommits ?? 0)}
                    </span>
                    <a
                      href={`https://github.com/search?q=${encodeURIComponent(agent.commitQuery)}&type=commits`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-gray-500 hidden sm:block"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
