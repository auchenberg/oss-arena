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

type ExtendedSortField = SortField | 'totalCommits' | 'combined';

export function Leaderboard({ agents }: LeaderboardProps) {
  const [sortField, setSortField] = useState<ExtendedSortField>('combined');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      if (sortField === 'combined') {
        aVal = a.stats.totalPRs + (a.stats.totalCommits ?? 0);
        bVal = b.stats.totalPRs + (b.stats.totalCommits ?? 0);
      } else {
        aVal = (a.stats as unknown as Record<string, number>)[sortField] ?? 0;
        bVal = (b.stats as unknown as Record<string, number>)[sortField] ?? 0;
      }
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

  const SortHeader = ({
    field,
    label,
    secondary = false
  }: {
    field: ExtendedSortField;
    label: string;
    secondary?: boolean;
  }) => (
    <th
      className={`px-4 py-3 text-left text-sm font-medium cursor-pointer hover:text-gray-700 transition-colors ${
        secondary ? 'text-gray-400' : 'text-gray-500'
      }`}
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
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Agent
            </th>
            <SortHeader field="mergedPRs" label="Merged PRs" secondary />
            <SortHeader field="readyPRs" label="Ready PRs" secondary />
            <SortHeader field="successRate" label="Success Rate" secondary />
            <th className="px-4 py-3 border-l border-gray-200"></th>
            <SortHeader field="totalPRs" label="Total PRs" />
            <SortHeader field="totalCommits" label="Total Commits" />
            <SortHeader field="combined" label="Total Work" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedAgents.map((agent, index) => (
            <tr
              key={agent.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-4 text-sm text-gray-400 font-mono">
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
              <td className="px-4 py-4 text-sm font-mono text-gray-400">
                {formatNumber(agent.stats.mergedPRs)}
              </td>
              <td className="px-4 py-4 text-sm font-mono text-gray-400">
                {formatNumber(agent.stats.readyPRs)}
              </td>
              <td className="px-4 py-4 text-sm font-mono text-gray-400">
                {agent.stats.successRate.toFixed(1)}%
              </td>
              <td className="px-4 py-4 border-l border-gray-200"></td>
              <td className="px-4 py-4 text-sm font-mono text-gray-700">
                {formatNumber(agent.stats.totalPRs)}
              </td>
              <td className="px-4 py-4 text-sm font-mono text-gray-700">
                {formatNumber(agent.stats.totalCommits ?? 0)}
              </td>
              <td className="px-4 py-4 text-sm font-mono text-gray-900 font-semibold">
                {formatNumber(agent.stats.totalPRs + (agent.stats.totalCommits ?? 0))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
