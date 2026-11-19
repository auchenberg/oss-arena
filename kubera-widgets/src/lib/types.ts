export interface KuberaCredentials {
  apiKey: string;
  secret: string;
}

export interface PortfolioListItem {
  id: string;
  name: string;
  currency: string;
}

export interface Holding {
  name: string;
  value: number;
  sheet?: string;
}

/**
 * The summary written to the App Group so the widget extension can render
 * immediately, even before its own network refresh completes. Keys must stay
 * in sync with `targets/widgets/Shared.swift`.
 */
export interface PortfolioSnapshot {
  portfolioId: string;
  portfolioName: string;
  currency: string;
  netWorth: number;
  assetTotal: number;
  debtTotal: number;
  costBasis: number;
  unrealizedGain: number;
  topHoldings: Holding[];
  /** Asset class name -> percent (0-100) */
  allocation: Record<string, number>;
  /** Unix seconds */
  updatedAt: number;
}

/**
 * User-facing widget preferences, shared with the widget extension.
 * Keys must stay in sync with `targets/widgets/Shared.swift`.
 */
export interface WidgetSettings {
  /** Mask all amounts on the Home Screen (shows ••••) */
  privacyMode: boolean;
  /** Show unrealized gain under the net worth number */
  showGain: boolean;
  /** Use compact numbers on widgets, e.g. $1.24M instead of $1,240,000 */
  compactNumbers: boolean;
}

export const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  privacyMode: false,
  showGain: true,
  compactNumbers: true,
};
