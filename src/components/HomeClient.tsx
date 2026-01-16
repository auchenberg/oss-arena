'use client';

import { useState } from 'react';
import { Leaderboard } from '@/components/Leaderboard';
import { ReviewsLeaderboard } from '@/components/ReviewsLeaderboard';
import { TrendChart } from '@/components/TrendChart';
import { TabNavigation } from '@/components/TabNavigation';
import { ViewMode, ContributionsData, ReviewsData, HistoryEntry } from '@/lib/types';

interface HomeClientProps {
  contributions: ContributionsData;
  reviews: ReviewsData;
  historyData: HistoryEntry[];
}

export function HomeClient({ contributions, reviews, historyData }: HomeClientProps) {
  const [activeTab, setActiveTab] = useState<ViewMode>('contributions');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              SWE Arena
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track AI coding agents contributing to open source
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-t-lg border border-gray-200 border-b-0">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-b-lg border border-gray-200 mb-8">
          {activeTab === 'contributions' ? (
            <Leaderboard agents={contributions.agents} />
          ) : (
            <ReviewsLeaderboard agents={reviews.agents} />
          )}
        </div>

        {/* Charts (only for contributions) */}
        {activeTab === 'contributions' && (
          <div className="space-y-8">
            {/* Ranking Over Time */}
            <TrendChart
              agents={contributions.agents}
              historyData={historyData}
              metric="ranking"
              title="Ranking Over Time"
            />

            {/* Total PRs Over Time */}
            <TrendChart
              agents={contributions.agents}
              historyData={historyData}
              metric="prs"
              title="Total PRs Over Time"
            />

            {/* Total Commits Over Time */}
            <TrendChart
              agents={contributions.agents}
              historyData={historyData}
              metric="commits"
              title="Total Commits Over Time"
            />
          </div>
        )}

        {/* Footer Info */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Data updated:{' '}
            <time className="font-mono">
              {new Date(
                activeTab === 'contributions'
                  ? contributions.lastUpdated
                  : reviews.lastUpdated
              ).toLocaleString('en-US', { timeZone: 'UTC' })} UTC
            </time>
          </p>
          <p className="mt-2">
            Source:{' '}
            <a
              href="https://github.com"
              className="text-blue-500 hover:text-blue-600"
            >
              GitHub Search API
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
