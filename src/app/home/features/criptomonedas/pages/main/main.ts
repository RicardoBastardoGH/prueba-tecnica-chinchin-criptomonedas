import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { BinanceService } from '../../services/binance.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CryptocurrencyBinance, CryptoDetails, KlineData } from '../../interfaces/binance_api';
import { interval, Subject, Subscription, takeUntil } from 'rxjs';
import { CoinGrekoApiService } from '../../services/coin-greko-api.service';
import { GeckoCryptocurrency } from '../../interfaces/coin_grecko_api';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { Consultar } from '../consultar/consultar';
import { Router } from '@angular/router';
import { DashboardData, PortfolioSummary } from '../../interfaces/dashboard_static_data';

@Component({
  selector: 'app-main',
  imports: [
    DatePipe,
    CommonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  templateUrl: './main.html',
  styles: ``,
})
export class Main implements OnInit {
  dialog = inject(MatDialog);
  // binanceService = inject(BinanceService);
  coinGrekoApiService = inject(CoinGrekoApiService);
  cryptoService = inject(CoinGrekoApiService);

  router = inject(Router);

  dashboardData: DashboardData | null = null;
  portfolioSummary: PortfolioSummary | null = null;
  loading: boolean = true;
  error: string = '';
  activeSection: string = 'Descripción general';
  refreshInterval: any;
  currentTime: Date = new Date();
  private destroy$ = new Subject<void>();

  // Table data
  displayedColumns: string[] = [
    'image',
    // 'name',
    'symbol',
    'current_price',
    'market_cap_change_percentage_24h',
  ];
  dataSource: MatTableDataSource<GeckoCryptocurrency> = new MatTableDataSource();

  @ViewChild(MatPaginator)
  paginator: MatPaginator = new MatPaginator();
  @ViewChild(MatSort)
  sort: MatSort = new MatSort();

  // Binance API data
  // cryptos: Cryptocurrency[] = [];
  // selectedCrypto: CryptoDetails | null = null;
  // historicalData: KlineData[] = [];
  // loading = false;

  subscription!: Subscription;

  constructor() {}

  ngOnInit() {
    // this.loadCryptocurrencies();
    this.loadCryptocurrenciesGreko();
    this.loadDashboardData();
  }

  cryptocurrencies: GeckoCryptocurrency[] = [];
  loadCryptocurrenciesGreko(): void {
    this.loading = true;
    this.error = '';

    this.coinGrekoApiService.getCryptocurrencies('usd', 1000).subscribe({
      next: (data) => {
        console.log(data);
        this.cryptocurrencies = data;
        this.dataSource.data = this.cryptocurrencies;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
        console.error('Error loading cryptocurrencies:', error);
      },
    });
  }
  ngAfterViewInit(): void {
    // Refresh data every 30 seconds
    const source = interval(30000);
    this.subscription = source.subscribe((val) => {
      console.log('testing interval');
      // this.loadCryptocurrencies();
      this.loadCryptocurrenciesGreko();
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onRowClick(row: GeckoCryptocurrency) {
    console.log(row);

    // navigate to consultar con param id
    // this.router.navigate(['/criptomonedas/consultar', row.id]);
    // this.router.navigate([`/criptomonedas/consultar/${row.id}`]);
    this.router.navigateByUrl(`/home/criptomonedas/consultar/${row.id}`);

    // const dialogRef = this.dialog.open(Consultar, {
    //   data: {
    //     ...row,
    //   },
    //   // disableClose: true,
    //   hasBackdrop: true,
    //   // maxWidth: '80vw',
    //   // minWidth: '80vw',
    //   maxWidth: '500px',
    //   // minWidth: '700px',
    //   // height: '100vh',
    //   // maxHeight: '90vh',
    //   // minHeight: '90vh',
    // });

    // dialogRef.afterClosed().subscribe(resp => {
    //   //ACA el codigo de que ya salio
    //   console.log('cerro consultar ');
    //   if (resp.reload) {
    //     this.getAirlines();
    //   }
    // });
  }

  // loadCryptocurrencies() {
  //   this.loading = true;
  //   this.binanceService.getAvailableCryptocurrencies().subscribe({
  //     next: (data) => {
  //       console.log(data);
  //       this.cryptos = data.filter(
  //         (crypto) => crypto.quoteAsset === 'USDT' && crypto.status === 'TRADING'
  //       );
  //       this.dataSource.data = this.cryptos;
  //       this.dataSource.paginator = this.paginator;
  //       this.dataSource.sort = this.sort;
  //       this.loading = false;
  //     },
  //     error: (error) => {
  //       console.error('Error loading cryptocurrencies:', error);
  //       this.loading = false;
  //     },
  //   });
  // }

  // onCryptoSelect(event: any) {
  //   const symbol = event.target.value;
  //   if (symbol) {
  //     this.binanceService.getCryptocurrencyDetails(symbol).subscribe({
  //       next: (details) => {
  //         console.log(details);
  //         this.selectedCrypto = details;
  //         this.loadHistoricalData(symbol);
  //       },
  //       error: (error) => {
  //         console.error('Error loading crypto details:', error);
  //       },
  //     });
  //   }
  // }

  // loadHistoricalData(symbol: string) {
  //   this.binanceService.getHistoricalPrices(symbol, '1d', 7).subscribe({
  //     next: (data) => {
  //       this.historicalData = data;
  //     },
  //     error: (error) => {
  //       console.error('Error loading historical data:', error);
  //     },
  //   });
  // }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    this.cryptoService
      .getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.portfolioSummary = this.cryptoService.getPortfolioSummary(data.assets);
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        },
      });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  }

  formatNumber(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  }

  formatPercentage(percent: number): string {
    return `${percent >= 0 ? '+' : ''}${percent?.toFixed(2) || '0.00'}%`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getChangeClass(change: number): string {
    return change >= 0 ? 'positive' : 'negative';
  }

  getTransactionClass(type: string): string {
    return type === 'buy' ? 'buy' : 'sell';
  }

  getStatusClass(status: string): string {
    return status;
  }

  changeSection(section: string): void {
    this.activeSection = section;
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}
