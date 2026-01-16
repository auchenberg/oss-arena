'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ContributionAgent, TimeRange, HistoryEntry } from '@/lib/types';

interface TrendChartProps {
  agents: ContributionAgent[];
  historyData?: HistoryEntry[];
  metric?: 'prs' | 'commits' | 'ranking';
  title?: string;
}

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '365d', label: '1Y' },
  { value: 'all', label: 'All' },
];

export function TrendChart({
  agents,
  historyData = [],
  metric = 'prs',
  title = 'PR Volume Over Time',
}: TrendChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [scale, setScale] = useState<'linear' | 'log'>('linear');
  const [visibleAgents, setVisibleAgents] = useState<Set<string>>(
    new Set(agents.map((a) => a.id))
  );

  // Filter history data based on time range
  const filteredData = historyData.filter((entry) => {
    if (timeRange === 'all') return true;
    const days = parseInt(timeRange);
    const entryDate = new Date(entry.date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return entryDate >= cutoff;
  });

  // Transform data for Recharts based on metric
  const chartData = filteredData.map((entry) => {
    const point: Record<string, string | number> = { date: entry.date };

    if (metric === 'ranking') {
      // Calculate rankings for this date based on combined score (prs + commits)
      const agentScores = agents.map((agent) => {
        const agentData = entry.contributions[agent.id];
        const prs = agentData?.prs || 0;
        const commits = agentData?.commits || 0;
        return { id: agent.id, score: prs + commits };
      });
      agentScores.sort((a, b) => b.score - a.score);

      agents.forEach((agent) => {
        if (visibleAgents.has(agent.id)) {
          const rank = agentScores.findIndex((s) => s.id === agent.id) + 1;
          point[agent.id] = rank;
        }
      });
    } else {
      agents.forEach((agent) => {
        if (visibleAgents.has(agent.id)) {
          const agentData = entry.contributions[agent.id];
          if (metric === 'commits') {
            point[agent.id] = agentData?.commits || 0;
          } else {
            point[agent.id] = agentData?.prs || 0;
          }
        }
      });
    }
    return point;
  });

  const toggleAgent = (agentId: string) => {
    const newVisible = new Set(visibleAgents);
    if (newVisible.has(agentId)) {
      newVisible.delete(agentId);
    } else {
      newVisible.add(agentId);
    }
    setVisibleAgents(newVisible);
  };

  // Show placeholder if no history data
  if (historyData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>Historical data will appear after the first data collection run.</p>
        </div>
      </div>
    );
  }

  // For ranking, we want lower numbers to be better (top of chart)
  const isRanking = metric === 'ranking';

  // Sort agents for legend based on metric
  const sortedAgents = useMemo(() => {
    const sorted = [...agents].sort((a, b) => {
      if (metric === 'ranking') {
        const aScore = (a.stats.totalPRs || 0) + (a.stats.totalCommits || 0);
        const bScore = (b.stats.totalPRs || 0) + (b.stats.totalCommits || 0);
        return bScore - aScore;
      } else if (metric === 'prs') {
        return (b.stats.totalPRs || 0) - (a.stats.totalPRs || 0);
      } else if (metric === 'commits') {
        return (b.stats.totalCommits || 0) - (a.stats.totalCommits || 0);
      }
      return 0;
    });
    return sorted;
  }, [agents, metric]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  timeRange === range.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Scale Toggle - hide for ranking */}
          {!isRanking && (
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setScale('linear')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  scale === 'linear'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => setScale('log')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  scale === 'log'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Log
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Legend - sorted by relevant metric (highest values first) */}
      <div className="flex flex-wrap gap-3 mb-4">
        {sortedAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => toggleAgent(agent.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                visibleAgents.has(agent.id)
                  ? 'bg-gray-100'
                  : 'bg-gray-50 opacity-50'
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: agent.color }}
              />
              <span className="text-gray-700">{agent.name}</span>
            </button>
          ))}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                // Use UTC methods to match stored UTC dates
                return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
              }}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              scale={isRanking ? 'linear' : scale}
              domain={isRanking ? [1, agents.length] : scale === 'log' ? ['auto', 'auto'] : [0, 'auto']}
              reversed={isRanking}
              tickFormatter={(value) => {
                if (isRanking) return `#${value}`;
                if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
                if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
                return value;
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#111827' }}
              formatter={(value, name) => {
                const agent = agents.find((a) => a.id === name);
                if (isRanking) {
                  return [`#${value}`, agent?.name || String(name)];
                }
                return [String(value ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), agent?.name || String(name)];
              }}
              itemSorter={(item) => {
                // Sort tooltip items: by rank ascending for ranking, by value descending for others
                const value = item.value as number;
                return isRanking ? value : -value;
              }}
            />
            {sortedAgents
              .filter((agent) => visibleAgents.has(agent.id))
              .map((agent) => (
                <Line
                  key={agent.id}
                  type="monotone"
                  dataKey={agent.id}
                  stroke={agent.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
