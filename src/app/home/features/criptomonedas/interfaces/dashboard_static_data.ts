export interface DashboardData {
  totalBalance: number;
  portfolioValue: number;
  portfolioChange: number;
  assets: DashboardAsset[];
  marketOverview: MarketOverview;
  recentTransactions: Transaction[];
}

export interface DashboardAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  amount: number;
  currentPrice: number;
  value: number;
  change24h: number;
  allocation: number;
}

export interface MarketOverview {
  totalMarketCap: number;
  totalVolume: number;
  bitcoinDominance: number;
  marketCapChange: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'receive' | 'send';
  asset: string;
  amount: number;
  price: number;
  value: number;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

export interface PortfolioSummary {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  bestPerformer: DashboardAsset;
  worstPerformer: DashboardAsset;
}
