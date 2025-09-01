import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { CryptocurrencyBinance, CryptoDetails, KlineData } from '../interfaces/binance_api';

@Injectable({
  providedIn: 'root',
})
export class BinanceService {
  // private proxyUrl = '/api/binance'; // Your proxy server endpoint

  //   constructor(private http: HttpClient) {}

  //   getExchangeInfo(): Observable<any> {
  //     return this.http.get(`${this.proxyUrl}/exchangeInfo`);
  //   }

  //   // Example for a private endpoint (requires authentication handled by proxy)
  //   getAccountInfo(): Observable<any> {
  //     return this.http.get(`${this.proxyUrl}/account`);
  //   }
  // }

  private baseUrl = 'https://api.binance.com/api/v3';
  private imageUrl = 'https://bin.bnbstatic.com/static/assets/logos/';
  private baseFuturesUrl = 'https://fapi.binance.com/fapi/v1';

  constructor(private http: HttpClient) {}
  /**
   * Retrieves all cryptocurrencies available for trading on Binance
   */
  getAvailableCryptocurrencies(): Observable<CryptocurrencyBinance[]> {
    const url = `${this.baseUrl}/exchangeInfo`;
    // const url = `${this.baseUrl}/spot/open-symbol-list`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        console.log(response);
        return response.symbols.map((symbol: any) => ({
          symbol: symbol.symbol,
          baseAsset: symbol.baseAsset,
          quoteAsset: symbol.quoteAsset,
          status: symbol.status,
          baseAssetPrecision: symbol.baseAssetPrecision,
          quotePrecision: symbol.quotePrecision,
        }));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves detailed information about a cryptocurrency by its symbol
   * @param symbol The cryptocurrency symbol (e.g., 'BTCUSDT')
   */
  getCryptocurrencyDetails(symbol: string): Observable<CryptoDetails> {
    const url = `${this.baseUrl}/ticker/24hr`;
    const params = new HttpParams().set('symbol', symbol.toUpperCase());

    return this.http.get<any>(url, { params }).pipe(
      map((response) => ({
        symbol: response.symbol,
        priceChange: response.priceChange,
        priceChangePercent: response.priceChangePercent,
        weightedAvgPrice: response.weightedAvgPrice,
        prevClosePrice: response.prevClosePrice,
        lastPrice: response.lastPrice,
        lastQty: response.lastQty,
        bidPrice: response.bidPrice,
        bidQty: response.bidQty,
        askPrice: response.askPrice,
        askQty: response.askQty,
        openPrice: response.openPrice,
        highPrice: response.highPrice,
        lowPrice: response.lowPrice,
        volume: response.volume,
        quoteVolume: response.quoteVolume,
        openTime: response.openTime,
        closeTime: response.closeTime,
        firstId: response.firstId,
        lastId: response.lastId,
        count: response.count,
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves historical price data (kline/candlestick) for a cryptocurrency
   * @param symbol The cryptocurrency symbol
   * @param interval Kline interval (1m, 5m, 1h, 1d, etc.)
   * @param limit Number of data points to retrieve
   */
  getHistoricalPrices(
    symbol: string,
    interval: string = '1d',
    limit: number = 30
  ): Observable<KlineData[]> {
    const url = `${this.baseUrl}/klines`;
    const params = new HttpParams()
      .set('symbol', symbol.toUpperCase())
      .set('interval', interval)
      .set('limit', limit.toString());

    return this.http.get<any[]>(url, { params }).pipe(
      map((klines) =>
        klines.map((kline) => ({
          openTime: kline[0],
          open: kline[1],
          high: kline[2],
          low: kline[3],
          close: kline[4],
          volume: kline[5],
          closeTime: kline[6],
          quoteAssetVolume: kline[7],
          numberOfTrades: kline[8],
          takerBuyBaseAssetVolume: kline[9],
          takerBuyQuoteAssetVolume: kline[10],
        }))
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Gets current price for a specific cryptocurrency
   * @param symbol The cryptocurrency symbol
   */
  getCurrentPrice(symbol: string): Observable<string> {
    const url = `${this.baseUrl}/ticker/price`;
    const params = new HttpParams().set('symbol', symbol.toUpperCase());

    return this.http.get<any>(url, { params }).pipe(
      map((response) => response.price),
      catchError(this.handleError)
    );
  }

  /**
   * Gets order book for a specific cryptocurrency
   * @param symbol The cryptocurrency symbol
   * @param limit Number of order book levels to return
   */
  getOrderBook(symbol: string, limit: number = 100): Observable<any> {
    const url = `${this.baseUrl}/depth`;
    const params = new HttpParams()
      .set('symbol', symbol.toUpperCase())
      .set('limit', limit.toString());

    return this.http.get<any>(url, { params }).pipe(catchError(this.handleError));
  }

  /**
   * Gets recent trades for a specific cryptocurrency
   * @param symbol The cryptocurrency symbol
   * @param limit Number of trades to return
   */
  getRecentTrades(symbol: string, limit: number = 500): Observable<any[]> {
    const url = `${this.baseUrl}/trades`;
    const params = new HttpParams()
      .set('symbol', symbol.toUpperCase())
      .set('limit', limit.toString());

    return this.http.get<any[]>(url, { params }).pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Binance API Error:', error);
    let errorMessage = 'An unknown error occurred!';

    if (error.error && error.error.msg) {
      errorMessage = error.error.msg;
    } else if (error.status) {
      errorMessage = `HTTP ${error.status}: ${error.statusText}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
