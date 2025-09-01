import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry, catchError, map, throwError } from 'rxjs';
import {
  Cryptocurrency,
  CryptoDetail,
  GeckoCryptocurrency,
  PriceHistory,
} from '../interfaces/coin_grecko_api';
import {
  DashboardAsset,
  DashboardData,
  PortfolioSummary,
  Transaction,
} from '../interfaces/dashboard_static_data';

@Injectable({
  providedIn: 'root',
})
export class CoinGrekoApiService {
  // Using CoinGecko API (free tier allows 50 calls/minute)
  private baseUrl = 'https://api.coingecko.com/api/v3';
  // private apiUrl = 'https://api.coingecko.com/api/v3/coins/markets';

  // Alternative APIs:
  // private apiUrl = 'https://api.coincap.io/v2/assets'; // CoinCap API
  // private apiUrl = 'https://api.binance.com/api/v3/ticker/24hr'; // Binance API

  constructor(private http: HttpClient) {}

  /**
   * Get list of cryptocurrencies with market data
   * @param vsCurrency The currency to display prices in (default: usd)
   * @param limit Number of results to return (default: 50)
   * @param order Sort order: market_cap_desc, volume_desc, etc.
   */
  getCryptocurrencies(
    vsCurrency: string = 'usd',
    limit: number = 50,
    order: string = 'market_cap_desc'
  ): Observable<GeckoCryptocurrency[]> {
    const params = new HttpParams()
      .set('vs_currency', vsCurrency)
      .set('order', order)
      .set('per_page', limit.toString())
      .set('page', '1')
      .set('sparkline', 'false')
      .set('price_change_percentage', '24h');

    return this.http.get<GeckoCryptocurrency[]>(`${this.baseUrl}/coins/markets`, { params }).pipe(
      //this.apiUrl, { params }).pipe(
      retry(2), // Retry failed requests up to 2 times
      catchError(this.handleError)
    );
  }

  /**
   * Get specific GeckoCryptocurrency by ID
   * @param id Cryptocurrency ID (e.g., 'bitcoin')
   */
  getCryptocurrencyById(id: string): Observable<GeckoCryptocurrency> {
    const params = new HttpParams().set('vs_currency', 'usd').set('ids', id);

    return this.http.get<GeckoCryptocurrency[]>(`${this.baseUrl}/coins/markets`, { params }).pipe(
      map((data) => data[0]), // Return first result
      catchError(this.handleError)
    );
  }

  /**
   * Search cryptocurrencies by name or symbol
   * @param query Search query
   */
  searchCryptocurrencies(query: string): Observable<GeckoCryptocurrency[]> {
    return this.getCryptocurrencies().pipe(
      map((cryptos) =>
        cryptos.filter(
          (crypto) =>
            crypto.name.toLowerCase().includes(query.toLowerCase()) ||
            crypto.symbol.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

      // Specific error messages
      if (error.status === 429) {
        errorMessage = 'API rate limit exceeded. Please try again later.';
      } else if (error.status === 404) {
        errorMessage = 'Cryptocurrency data not found.';
      }
    }

    console.error('CryptoService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Get detailed cryptocurrency information
  getCryptocurrencyDetail(id: string): Observable<CryptoDetail> {
    const url = `${this.baseUrl}/coins/${id}`;
    const params = new HttpParams()
      .set('localization', 'false')
      .set('tickers', 'false')
      .set('market_data', 'true')
      .set('community_data', 'false')
      .set('developer_data', 'false')
      .set('sparkline', 'false');

    return this.http
      .get<CryptoDetail>(url, { params })
      .pipe(retry(2), catchError(this.handleError));
  }
  // Get historical price data for charts
  getPriceHistory(
    id: string,
    vsCurrency: string = 'usd',
    days: number = 7
  ): Observable<PriceHistory> {
    const url = `${this.baseUrl}/coins/${id}/market_chart`;
    const params = new HttpParams()
      .set('vs_currency', vsCurrency)
      .set('days', days.toString())
      .set('interval', days <= 1 ? 'hourly' : days <= 90 ? 'daily' : 'daily');

    return this.http
      .get<PriceHistory>(url, { params })
      .pipe(retry(2), catchError(this.handleError));
  }

  /**
   * Get OHLC data (Open, High, Low, Close)
   */
  getOHLCData(
    id: string,
    vsCurrency: string = 'usd',
    days: number = 7
  ): Observable<[number, number, number, number, number][]> {
    const url = `${this.baseUrl}/coins/${id}/ohlc`;
    const params = new HttpParams().set('vs_currency', vsCurrency).set('days', days.toString());

    return this.http
      .get<[number, number, number, number, number][]>(url, { params })
      .pipe(retry(2), catchError(this.handleError));
  }

  // Generando la data estatica
  getDashboardData(): Observable<DashboardData> {
    return this.getCryptocurrencies('usd', 50).pipe(
      map((cryptos) => this.generateDashboardData(cryptos)),
      catchError(this.handleError)
    );
  }

  private generateDashboardData(cryptos: Cryptocurrency[]): DashboardData {
    // Static user portfolio (simulated data)
    const userPortfolio: DashboardAsset[] = [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        amount: 0.5,
        currentPrice: cryptos.find((c) => c.id === 'bitcoin')?.current_price || 0,
        value: 0,
        change24h: cryptos.find((c) => c.id === 'bitcoin')?.price_change_percentage_24h || 0,
        allocation: 0,
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        amount: 2.5,
        currentPrice: cryptos.find((c) => c.id === 'ethereum')?.current_price || 0,
        value: 0,
        change24h: cryptos.find((c) => c.id === 'ethereum')?.price_change_percentage_24h || 0,
        allocation: 0,
      },
      {
        id: 'cardano',
        symbol: 'ada',
        name: 'Cardano',
        image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
        amount: 1000,
        currentPrice: cryptos.find((c) => c.id === 'cardano')?.current_price || 0,
        value: 0,
        change24h: cryptos.find((c) => c.id === 'cardano')?.price_change_percentage_24h || 0,
        allocation: 0,
      },
      {
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        amount: 15,
        currentPrice: cryptos.find((c) => c.id === 'solana')?.current_price || 0,
        value: 0,
        change24h: cryptos.find((c) => c.id === 'solana')?.price_change_percentage_24h || 0,
        allocation: 0,
      },
    ];

    // Calculate values and allocations
    let totalPortfolioValue = 0;
    userPortfolio.forEach((asset) => {
      asset.value = asset.amount * asset.currentPrice;
      totalPortfolioValue += asset.value;
    });

    userPortfolio.forEach((asset) => {
      asset.allocation = (asset.value / totalPortfolioValue) * 100;
    });

    // Generate market overview
    const totalMarketCap = cryptos.reduce((sum, crypto) => sum + (crypto.market_cap || 0), 0);
    const totalVolume = cryptos.reduce((sum, crypto) => sum + crypto.total_volume, 0);
    const bitcoin = cryptos.find((c) => c.id === 'bitcoin');
    const bitcoinDominance = bitcoin ? ((bitcoin.market_cap || 0) / totalMarketCap) * 100 : 0;

    // Static transactions (simulated data)
    const recentTransactions: Transaction[] = [
      {
        id: '1',
        type: 'buy',
        asset: 'BTC',
        amount: 0.1,
        price: 45000,
        value: 4500,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'completed',
      },
      {
        id: '2',
        type: 'sell',
        asset: 'ETH',
        amount: 0.5,
        price: 3200,
        value: 1600,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'completed',
      },
      {
        id: '3',
        type: 'buy',
        asset: 'SOL',
        amount: 5,
        price: 180,
        value: 900,
        date: new Date(Date.now() - 12 * 60 * 60 * 1000),
        status: 'completed',
      },
    ];

    return {
      totalBalance: 12500, // Static total balance
      portfolioValue: totalPortfolioValue,
      portfolioChange: userPortfolio.reduce(
        (sum, asset) => sum + asset.value * (asset.change24h / 100),
        0
      ),
      assets: userPortfolio,
      marketOverview: {
        totalMarketCap,
        totalVolume,
        bitcoinDominance,
        marketCapChange: 2.5, // Static change percentage
      },
      recentTransactions,
    };
  }

  getPortfolioSummary(assets: DashboardAsset[]): PortfolioSummary {
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalChange = assets.reduce(
      (sum, asset) => sum + asset.value * (asset.change24h / 100),
      0
    );
    const totalChangePercent = (totalChange / totalValue) * 100;

    const sortedByPerformance = [...assets].sort((a, b) => b.change24h - a.change24h);

    return {
      totalValue,
      totalChange,
      totalChangePercent,
      bestPerformer: sortedByPerformance[0],
      worstPerformer: sortedByPerformance[sortedByPerformance.length - 1],
    };
  }
}
