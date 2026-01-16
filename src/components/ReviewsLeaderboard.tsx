'use client';

import { useState, useMemo } from 'react';
import { ReviewAgent } from '@/lib/types';

interface ReviewsLeaderboardProps {
  agents: ReviewAgent[];
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

type ReviewSortField = 'totalReviews' | 'last7Days';

export function ReviewsLeaderboard({ agents }: ReviewsLeaderboardProps) {
  const [sortField, setSortField] = useState<ReviewSortField>('totalReviews');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      const aVal = a.stats[sortField];
      const bVal = b.stats[sortField];
      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [agents, sortField, sortDirection]);

  const handleSort = (field: ReviewSortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortHeader = ({ field, label }: { field: ReviewSortField; label: string }) => (
    <th
      className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && (
          <span className="text-blue-500">
            {sortDirection === 'desc' ? '↓' : '↑'}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Bot
            </th>
            <SortHeader field="totalReviews" label="Total Reviews" />
            <SortHeader field="last7Days" label="Last 7 Days" />
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Trend
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedAgents.map((agent, index) => (
            <tr
              key={agent.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-4 text-sm text-gray-500 font-mono">
                {index + 1}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                  <span className="font-medium text-gray-900">
                    {agent.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 text-sm font-mono text-gray-700">
                {formatNumber(agent.stats.totalReviews)}
              </td>
              <td className="px-4 py-4 text-sm font-mono text-gray-700">
                {formatNumber(agent.stats.last7Days)}
              </td>
              <td className="px-4 py-4 text-sm font-mono">
                {agent.stats.trend > 0 ? (
                  <span className="text-green-600">
                    ↑ {agent.stats.trend.toFixed(1)}%
                  </span>
                ) : agent.stats.trend < 0 ? (
                  <span className="text-red-600">
                    ↓ {Math.abs(agent.stats.trend).toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
