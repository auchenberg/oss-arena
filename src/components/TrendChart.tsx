'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ContributionAgent, TimeRange } from '@/lib/types';

interface TrendChartProps {
  agents: ContributionAgent[];
  historyData?: Array<{
    date: string;
    contributions: Record<string, { prs: number; merged: number }>;
  }>;
}

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '365d', label: '1Y' },
  { value: 'all', label: 'All' },
];

export function TrendChart({ agents, historyData = [] }: TrendChartProps) {
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

  // Transform data for Recharts
  const chartData = filteredData.map((entry) => {
    const point: Record<string, string | number> = { date: entry.date };
    agents.forEach((agent) => {
      if (visibleAgents.has(agent.id)) {
        const agentData = entry.contributions[agent.id];
        point[agent.id] = agentData?.prs || 0;
      }
    });
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
          <h3 className="text-lg font-semibold text-gray-900">
            PR Volume Over Time
          </h3>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>Historical data will appear after the first data collection run.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          PR Volume Over Time
        </h3>

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

          {/* Scale Toggle */}
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
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {agents.map((agent) => (
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
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              scale={scale}
              domain={scale === 'log' ? ['auto', 'auto'] : [0, 'auto']}
              tickFormatter={(value) => {
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
                return [String(value ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), agent?.name || String(name)];
              }}
            />
            {agents
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
