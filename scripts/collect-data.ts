import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Agent configuration for data collection
const contributionAgents = [
  { id: 'copilot', name: 'GitHub Copilot', color: '#6e40c9', query: 'head:copilot/' },
  { id: 'cursor', name: 'Cursor', color: '#00d4aa', query: 'head:cursor/' },
  { id: 'codex', name: 'OpenAI Codex', color: '#10a37f', query: 'head:codex/' },
  { id: 'devin', name: 'Devin', color: '#ff6b6b', query: 'author:devin-ai-integration[bot]' },
  { id: 'claude', name: 'Claude Code', color: '#d97706', query: 'author:app/claude' },
  { id: 'jules', name: 'Jules', color: '#4285f4', query: 'author:jules-google[bot]' },
  { id: 'codegen', name: 'Codegen', color: '#9333ea', query: 'author:codegen-sh[bot]' },
];

const reviewAgents = [
  { id: 'coderabbit', name: 'CodeRabbit', color: '#f97316', query: 'commenter:coderabbitai[bot]' },
  { id: 'ellipsis', name: 'Ellipsis', color: '#06b6d4', query: 'commenter:ellipsis-dev[bot]' },
  { id: 'sourcery', name: 'Sourcery', color: '#ec4899', query: 'commenter:sourcery-ai[bot]' },
  { id: 'greptile', name: 'Greptile', color: '#22c55e', query: 'commenter:greptileai[bot]' },
  { id: 'qodo', name: 'Qodo', color: '#8b5cf6', query: 'commenter:qodo-merge-pro[bot]' },
  { id: 'mesa', name: 'Mesa', color: '#0ea5e9', query: 'commenter:mesa-dev[bot]' },
  { id: 'vercel', name: 'Vercel Agent', color: '#000000', query: 'commenter:vercel-agent[bot]' },
];

// Delay helper to respect rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Rate limit: GitHub Search API allows 30 requests/minute for authenticated users
// We'll use 3 second delays to stay well under the limit
const RATE_LIMIT_DELAY = 3000;
const MAX_RETRIES = 3;

// Wrapper for API calls with retry logic
async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.status === 403 || error.status === 429)) {
      const waitTime = error.response?.headers?.['retry-after']
        ? parseInt(error.response.headers['retry-after']) * 1000
        : 60000; // Default 1 minute wait
      console.log(`    Rate limited. Waiting ${waitTime / 1000}s before retry...`);
      await delay(waitTime);
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

async function collectContributions() {
  console.log('Collecting contribution data...');
  const results = [];

  for (const agent of contributionAgents) {
    console.log(`  Querying ${agent.name}...`);

    try {
      // Get total PRs
      const { data: allPRs } = await withRetry(() =>
        octokit.search.issuesAndPullRequests({
          q: `is:pr ${agent.query}`,
          per_page: 1,
        })
      );
      await delay(RATE_LIMIT_DELAY);

      // Get merged PRs
      const { data: mergedPRs } = await withRetry(() =>
        octokit.search.issuesAndPullRequests({
          q: `is:pr is:merged ${agent.query}`,
          per_page: 1,
        })
      );
      await delay(RATE_LIMIT_DELAY);

      // Get ready (non-draft) PRs
      const { data: readyPRs } = await withRetry(() =>
        octokit.search.issuesAndPullRequests({
          q: `is:pr -is:draft ${agent.query}`,
          per_page: 1,
        })
      );
      await delay(RATE_LIMIT_DELAY);

      const successRate = readyPRs.total_count > 0
        ? Number(((mergedPRs.total_count / readyPRs.total_count) * 100).toFixed(2))
        : 0;

      results.push({
        id: agent.id,
        name: agent.name,
        color: agent.color,
        stats: {
          totalPRs: allPRs.total_count,
          readyPRs: readyPRs.total_count,
          mergedPRs: mergedPRs.total_count,
          successRate,
        },
      });

      console.log(`    Total: ${allPRs.total_count}, Merged: ${mergedPRs.total_count}, Rate: ${successRate}%`);
    } catch (error) {
      console.error(`    Error querying ${agent.name}:`, error);
      // Keep previous data if query fails
      results.push({
        id: agent.id,
        name: agent.name,
        color: agent.color,
        stats: {
          totalPRs: 0,
          readyPRs: 0,
          mergedPRs: 0,
          successRate: 0,
        },
      });
    }
  }

  return results;
}

async function collectReviews() {
  console.log('Collecting review data...');
  const results = [];

  for (const agent of reviewAgents) {
    console.log(`  Querying ${agent.name}...`);

    try {
      // Get total PRs with comments from this bot
      const { data: allReviews } = await withRetry(() =>
        octokit.search.issuesAndPullRequests({
          q: `is:pr ${agent.query}`,
          per_page: 1,
        })
      );
      await delay(RATE_LIMIT_DELAY);

      // Get last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dateStr = sevenDaysAgo.toISOString().split('T')[0];

      const { data: recentReviews } = await withRetry(() =>
        octokit.search.issuesAndPullRequests({
          q: `is:pr ${agent.query} created:>${dateStr}`,
          per_page: 1,
        })
      );
      await delay(RATE_LIMIT_DELAY);

      results.push({
        id: agent.id,
        name: agent.name,
        color: agent.color,
        stats: {
          totalReviews: allReviews.total_count,
          last7Days: recentReviews.total_count,
          trend: 0, // Would need historical data to calculate
        },
      });

      console.log(`    Total: ${allReviews.total_count}, Last 7 days: ${recentReviews.total_count}`);
    } catch (error) {
      console.error(`    Error querying ${agent.name}:`, error);
      results.push({
        id: agent.id,
        name: agent.name,
        color: agent.color,
        stats: {
          totalReviews: 0,
          last7Days: 0,
          trend: 0,
        },
      });
    }
  }

  return results;
}

async function saveHistorySnapshot(contributions: any[], reviews: any[]) {
  const today = new Date().toISOString().split('T')[0];
  const historyPath = path.join(process.cwd(), 'data', 'history', `${today}.json`);

  const historyData = {
    date: today,
    contributions: contributions.reduce((acc, agent) => {
      acc[agent.id] = { prs: agent.stats.totalPRs, merged: agent.stats.mergedPRs };
      return acc;
    }, {} as Record<string, { prs: number; merged: number }>),
    reviews: reviews.reduce((acc, agent) => {
      acc[agent.id] = { count: agent.stats.totalReviews };
      return acc;
    }, {} as Record<string, { count: number }>),
  };

  fs.writeFileSync(historyPath, JSON.stringify(historyData, null, 2));
  console.log(`Saved history snapshot to ${historyPath}`);
}

async function main() {
  console.log('Starting data collection...\n');

  const contributions = await collectContributions();
  const reviews = await collectReviews();

  const now = new Date().toISOString();

  // Save contributions
  const contributionsData = {
    lastUpdated: now,
    agents: contributions,
  };
  fs.writeFileSync(
    path.join(process.cwd(), 'data', 'contributions.json'),
    JSON.stringify(contributionsData, null, 2)
  );
  console.log('\nSaved contributions.json');

  // Save reviews
  const reviewsData = {
    lastUpdated: now,
    agents: reviews,
  };
  fs.writeFileSync(
    path.join(process.cwd(), 'data', 'reviews.json'),
    JSON.stringify(reviewsData, null, 2)
  );
  console.log('Saved reviews.json');

  // Save history snapshot
  await saveHistorySnapshot(contributions, reviews);

  console.log('\nData collection complete!');
}

main().catch(console.error);
