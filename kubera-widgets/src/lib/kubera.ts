import { hmac } from '@noble/hashes/hmac.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';

import type {
  Holding,
  KuberaCredentials,
  PortfolioListItem,
  PortfolioSnapshot,
} from '@/lib/types';

const BASE_URL = 'https://api.kubera.com';

export class KuberaError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'KuberaError';
  }
}

/**
 * Kubera signs requests with HMAC-SHA256 over
 * `apiKey + unixTimestamp + METHOD + path + body`, hex-encoded, sent in the
 * x-signature header. Mirrored in `targets/widgets/KuberaAPI.swift`.
 */
async function request<T>(creds: KuberaCredentials, path: string): Promise<T> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const payload = `${creds.apiKey}${timestamp}GET${path}`;
  const signature = bytesToHex(hmac(sha256, utf8ToBytes(creds.secret), utf8ToBytes(payload)));

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-token': creds.apiKey,
      'x-timestamp': timestamp,
      'x-signature': signature,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new KuberaError('Authentication failed. Check your API key and secret.', 401);
    }
    if (res.status === 429) {
      throw new KuberaError('Kubera rate limit reached. Try again in a minute.', 429);
    }
    throw new KuberaError(`Kubera API error (HTTP ${res.status})`, res.status);
  }

  return (await res.json()) as T;
}

interface PortfolioListResponse {
  data?: { id: string; name: string; currency: string }[];
}

export async function listPortfolios(creds: KuberaCredentials): Promise<PortfolioListItem[]> {
  const res = await request<PortfolioListResponse>(creds, '/api/v3/data/portfolio');
  return (res.data ?? []).map((p) => ({ id: p.id, name: p.name, currency: p.currency }));
}

interface PortfolioDetailResponse {
  data?: {
    id: string;
    name: string;
    ticker?: string;
    currency?: string;
    netWorth?: number;
    assetTotal?: number;
    debtTotal?: number;
    costBasis?: number;
    unrealizedGain?: number;
    allocationByAssetClass?: Record<string, number>;
    asset?: { name: string; value?: { amount?: number }; sheetName?: string }[];
  };
}

export async function getPortfolioSnapshot(
  creds: KuberaCredentials,
  portfolioId: string
): Promise<PortfolioSnapshot> {
  const res = await request<PortfolioDetailResponse>(
    creds,
    `/api/v3/data/portfolio/${portfolioId}`
  );
  const d = res.data;
  if (!d) {
    throw new KuberaError('Kubera returned an empty portfolio.');
  }

  const topHoldings: Holding[] = (d.asset ?? [])
    .map((a) => ({ name: a.name, value: a.value?.amount ?? 0, sheet: a.sheetName }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const allocation: Record<string, number> = {};
  for (const [key, value] of Object.entries(d.allocationByAssetClass ?? {})) {
    if (typeof value === 'number' && value > 0) {
      allocation[key] = value;
    }
  }

  return {
    portfolioId: d.id,
    portfolioName: d.name,
    currency: d.ticker ?? d.currency ?? 'USD',
    netWorth: d.netWorth ?? 0,
    assetTotal: d.assetTotal ?? 0,
    debtTotal: d.debtTotal ?? 0,
    costBasis: d.costBasis ?? 0,
    unrealizedGain: d.unrealizedGain ?? 0,
    topHoldings,
    allocation,
    updatedAt: Math.floor(Date.now() / 1000),
  };
}
