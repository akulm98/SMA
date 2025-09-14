export interface Stock {
  id: number;
  symbol: string;
  companyName: string;
  ltp: number; // Last Traded Price
  open: number;
  high: number;
  low: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdated: string;
  error?: string;
  [key: string]: any; // For additional CSV columns
}