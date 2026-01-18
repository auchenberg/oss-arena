"use client";

import { ReviewsLeaderboard } from "@/components/ReviewsLeaderboard";
import { Header } from "@/components/Header";
import { ReviewsData } from "@/lib/types";

interface CodeReviewsClientProps {
  reviews: ReviewsData;
}

export function CodeReviewsClient({ reviews }: CodeReviewsClientProps) {
  // Calculate total reviews
  const totalReviews = reviews.agents.reduce(
    (sum, agent) => sum + agent.stats.totalReviews,
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
            Code Review Leaderboard
          </h1>
          <p className="text-base sm:text-lg text-gray-500 mb-3 sm:mb-4">
            Tracking open-source code reviews by AI Agents
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold text-gray-700">
              {totalReviews.toLocaleString()}
            </span>
            <span>total reviews tracked</span>
          </div>
        </div>

        {/* Current Rankings Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            Current rankings for code reviews
          </h2>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg border border-gray-200">
            <ReviewsLeaderboard agents={reviews.agents} />
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-12 text-center text-sm text-gray-400">
          <p>
            Data updated:{" "}
            <time className="font-mono">
              {new Date(reviews.lastUpdated).toLocaleString("en-US", {
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
