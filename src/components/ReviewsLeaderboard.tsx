"use client";

import { useState, useMemo } from "react";
import { ReviewAgent } from "@/lib/types";

interface ReviewsLeaderboardProps {
  agents: ReviewAgent[];
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

type ReviewSortField = "totalReviews" | "last7Days";

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

export function ReviewsLeaderboard({ agents }: ReviewsLeaderboardProps) {
  const [sortField, setSortField] = useState<ReviewSortField>("totalReviews");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      const aVal = a.stats[sortField];
      const bVal = b.stats[sortField];
      return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [agents, sortField, sortDirection]);

  const handleSort = (field: ReviewSortField) => {
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
    field: ReviewSortField;
    label: string;
    align?: "left" | "right";
  }) => (
    <th
      className={`px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors ${
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
            <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-left w-20">
              Rank
            </th>
            <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-left">
              Bot
            </th>
            <SortHeader
              field="totalReviews"
              label="Total Reviews"
              align="right"
            />
            <SortHeader field="last7Days" label="Last 7 Days" align="right" />
            <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">
              Trend
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedAgents.map((agent, index) => {
            const rank = index + 1;
            return (
              <tr
                key={agent.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4">
                  <RankBadge rank={rank} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: agent.color }}
                    />
                    <span className="font-medium text-gray-900">
                      {agent.name}
                    </span>
                    <a
                      href={`https://github.com/search?q=${encodeURIComponent(
                        `is:pr commenter:${agent.id}ai[bot]`
                      )}&type=pullrequests`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-gray-500"
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
                <td className="px-4 py-4 text-right">
                  <span className="font-semibold text-gray-900">
                    {formatNumber(agent.stats.totalReviews)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right text-gray-600">
                  {formatNumber(agent.stats.last7Days)}
                </td>
                <td className="px-4 py-4 text-right">
                  {agent.stats.trend > 0 ? (
                    <span className="text-green-600 font-medium">
                      ↑ {agent.stats.trend.toFixed(1)}%
                    </span>
                  ) : agent.stats.trend < 0 ? (
                    <span className="text-red-500 font-medium">
                      ↓ {Math.abs(agent.stats.trend).toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
