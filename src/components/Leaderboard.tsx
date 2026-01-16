'use client';

import { useState, useMemo } from 'react';
import { ContributionAgent, SortField, SortDirection } from '@/lib/types';

interface LeaderboardProps {
  agents: ContributionAgent[];
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

type ExtendedSortField = SortField | 'totalCommits';

export function Leaderboard({ agents }: LeaderboardProps) {
  const [sortField, setSortField] = useState<ExtendedSortField>('mergedPRs');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      const aVal = (a.stats as unknown as Record<string, number>)[sortField] ?? 0;
      const bVal = (b.stats as unknown as Record<string, number>)[sortField] ?? 0;
      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [agents, sortField, sortDirection]);

  const handleSort = (field: ExtendedSortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortHeader = ({ field, label }: { field: ExtendedSortField; label: string }) => (
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
              Agent
            </th>
            <SortHeader field="totalPRs" label="Total PRs" />
            <SortHeader field="readyPRs" label="Ready PRs" />
            <SortHeader field="mergedPRs" label="Merged" />
            <SortHeader field="successRate" label="Success Rate" />
            <SortHeader field="totalCommits" label="Commits" />
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
                {formatNumber(agent.stats.totalPRs)}
              </td>
              <td className="px-4 py-4 text-sm font-mono text-gray-700">
                {formatNumber(agent.stats.readyPRs)}
              </td>
              <td className="px-4 py-4 text-sm font-mono text-gray-700">
                {formatNumber(agent.stats.mergedPRs)}
              </td>
              <td className="px-4 py-4 text-sm font-mono">
                <span
                  className={
                    agent.stats.successRate >= 90
                      ? 'text-green-600'
                      : agent.stats.successRate >= 70
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }
                >
                  {agent.stats.successRate.toFixed(1)}%
                </span>
              </td>
              <td className="px-4 py-4 text-sm font-mono text-gray-700">
                {formatNumber(agent.stats.totalCommits ?? 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
