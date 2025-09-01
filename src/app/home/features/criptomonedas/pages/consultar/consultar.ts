import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoinGrekoApiService } from '../../services/coin-greko-api.service';
import { CryptoDetail, PriceHistory } from '../../interfaces/coin_grecko_api';
import { ChartConfiguration, ChartType, ChartData, ChartDataset } from 'chart.js';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgChartsConfiguration } from 'ng2-charts';

import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-consultar',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './consultar.html',
  styles: ``,
})
export class Consultar implements OnInit, OnDestroy {
  cryptoService = inject(CoinGrekoApiService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  cryptoId: string = '';
  cryptoDetail: CryptoDetail | null = null;
  loading: boolean = true;
  error: string = '';
  activeTab: string = 'gráficos';
  chartDays: number = 7;
  chartType: 'price' | 'volume' = 'price';

  // Chart data
  chartData: ChartDataset[] = [];
  chartLabels: any[] = [];
  public chartOptions: ChartConfiguration['options'] = {};
  public chartTypeConfig: ChartType = 'line';

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.cryptoId = params['id'];
      if (this.cryptoId) {
        this.loadCryptoDetail();
        this.loadPriceHistory();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCryptoDetail(): void {
    this.loading = true;
    this.error = '';

    this.cryptoService
      .getCryptocurrencyDetail(this.cryptoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.cryptoDetail = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        },
      });
  }

  loadPriceHistory(): void {
    this.cryptoService
      .getPriceHistory(this.cryptoId, 'usd', this.chartDays)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.updateChartData(data);
        },
        error: (error) => {
          console.error('Error loading price history:', error);
        },
      });
  }

  updateChartData(history: PriceHistory): void {
    const labels = history.prices.map(([timestamp]) => timestamp);
    const priceData = history.prices.map(([, price]) => price);
    const volumeData = history.total_volumes.map(([, volume]) => volume);

    this.chartLabels = labels;

    if (this.chartType === 'price') {
      this.chartData = [
        {
          data: priceData,
          label: 'Price',
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#007bff',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#007bff',
        },
      ];
    } else {
      this.chartData = [
        {
          data: volumeData,
          label: 'Volume',
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#28a745',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#28a745',
        },
      ];
    }

    this.updateChartOptions();
  }

  updateChartOptions(): void {
    const isPriceChart = this.chartType === 'price';
    const isDaily = this.chartDays > 1;

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: isDaily ? 'day' : 'hour',
            displayFormats: {
              hour: 'HH:mm',
              day: 'MMM d',
            },
            tooltipFormat: isDaily ? 'MMM d, yyyy' : 'MMM d, yyyy HH:mm',
          },
          adapters: {
            date: {
              locale: enUS,
            },
          },
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          beginAtZero: this.chartType === 'volume',
          ticks: {
            callback: (value) => {
              if (typeof value === 'number') {
                if (this.chartType === 'volume') {
                  // Format volume values
                  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
                  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
                  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
                  return `$${value}`;
                }
                return `$${value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`;
              }
              return value;
            },
          },
          title: {
            display: true,
            text: this.chartType === 'price' ? 'Price (USD)' : 'Volume (USD)',
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              if (this.chartType === 'volume') {
                return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
              }
              return `$${value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;
            },
          },
        },
      },
    };
  }

  changeTimeRange(days: number): void {
    this.chartDays = days;
    this.loadPriceHistory();
  }

  changeChartType(type: 'price' | 'volume'): void {
    this.chartType = type;
    // Reload data to update the chart
    this.loadPriceHistory();
  }

  changeTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'charts') {
      // Ensure chart is updated when switching to charts tab
      this.loadPriceHistory();
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 8 : 2,
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

  getPriceChangeClass(change: number): string {
    return change >= 0 ? 'positive' : 'negative';
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
  // Old Implementations

  // destroy$ = new Subject<void>();

  // ngOnInit(): void {
  //   this.getCryptocurrencyById(this.data.id);
  // }
  // data = inject(MAT_DIALOG_DATA);

  // loading: boolean = true;
  // error: string = '';
  // getCryptocurrencyById(id: string) {
  //   this.loading = true;
  //   this.error = '';

  //   this.coinGrekoApiService.getCryptocurrencyById(id).subscribe({
  //     next: (data) => {
  //       console.log(data);
  //       this.data = data;
  //       this.loading = false;
  //     },
  //     error: (error) => {
  //       this.error = error.message;
  //       this.loading = false;
  //     },
  //   });
  // }

  // cryptoId: string = '';
  // cryptoDetail: CryptoDetail | null = null;
  // loading: boolean = true;
  // error: string = '';
  // activeTab: string = 'overview';
  // chartDays: number = 7;
  // chartType: 'price' | 'volume' = 'price';

  // // Chart configurations
  // public priceChartData: ChartConfiguration['data'] = {
  //   datasets: [{ data: [] }],
  // };
  // public volumeChartData: ChartConfiguration['data'] = {
  //   datasets: [{ data: [] }],
  // };
  // public chartOptions: ChartConfiguration['options'] = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   scales: {
  //     x: {
  //       type: 'time',
  //       time: {
  //         unit: this.chartDays <= 1 ? 'hour' : 'day',
  //       },
  //     },
  //     y: {
  //       ticks: {
  //         callback: function (value) {
  //           return '$' + value;
  //         },
  //       },
  //     },
  //   },
  //   plugins: {
  //     legend: {
  //       display: false,
  //     },
  //     tooltip: {
  //       callbacks: {
  //         label: function (context) {
  //           return '$' + context.parsed.y.toFixed(2);
  //         },
  //       },
  //     },
  //   },
  // };
  // public chartTypeConfig: ChartType = 'line';

  // private destroy$ = new Subject<void>();

  // constructor(
  //   private route: ActivatedRoute,
  //   private router: Router // private cryptoService: CryptoService
  // ) {}

  // ngOnInit(): void {
  //   this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
  //     this.cryptoId = params['id'];
  //     if (this.cryptoId) {
  //       this.loadCryptoDetail();
  //       this.loadPriceHistory();
  //     }
  //   });
  // }

  // ngOnDestroy(): void {
  //   this.destroy$.next();
  //   this.destroy$.complete();
  // }

  // loadCryptoDetail(): void {
  //   this.loading = true;
  //   this.error = '';

  //   this.cryptoService
  //     .getCryptocurrencyDetail(this.cryptoId)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (data) => {
  //         this.cryptoDetail = data;
  //         this.loading = false;
  //       },
  //       error: (error) => {
  //         this.error = error.message;
  //         this.loading = false;
  //       },
  //     });
  // }

  // loadPriceHistory(): void {
  //   this.cryptoService
  //     .getPriceHistory(this.cryptoId, 'usd', this.chartDays)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (data) => {
  //         this.updateChartData(data);
  //       },
  //       error: (error) => {
  //         console.error('Error loading price history:', error);
  //       },
  //     });
  // }

  // updateChartData(history: PriceHistory): void {
  //   const prices = history.prices.map(([timestamp, price]) => ({
  //     x: timestamp,
  //     y: price,
  //   }));

  //   const volumes = history.total_volumes.map(([timestamp, volume]) => ({
  //     x: timestamp,
  //     y: volume,
  //   }));

  //   this.priceChartData = {
  //     datasets: [
  //       {
  //         data: prices,
  //         borderColor: '#007bff',
  //         backgroundColor: 'rgba(0, 123, 255, 0.1)',
  //         fill: true,
  //         tension: 0.4,
  //       },
  //     ],
  //   };

  //   this.volumeChartData = {
  //     datasets: [
  //       {
  //         data: volumes,
  //         borderColor: '#28a745',
  //         backgroundColor: 'rgba(40, 167, 69, 0.1)',
  //         fill: true,
  //         tension: 0.4,
  //       },
  //     ],
  //   };
  // }

  // changeTimeRange(days: number): void {
  //   this.chartDays = days;
  //   this.loadPriceHistory();
  // }

  // changeChartType(type: 'price' | 'volume'): void {
  //   this.chartType = type;
  // }

  // changeTab(tab: string): void {
  //   this.activeTab = tab;
  // }

  // formatPrice(price: number): string {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: 'USD',
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: price < 1 ? 8 : 2,
  //   }).format(price);
  // }

  // formatNumber(num: number): string {
  //   if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  //   if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  //   if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  //   return num.toFixed(2);
  // }

  // formatPercentage(percent: number): string {
  //   return `${percent >= 0 ? '+' : ''}${percent?.toFixed(2) || '0.00'}%`;
  // }

  // getPriceChangeClass(change: number): string {
  //   return change >= 0 ? 'positive' : 'negative';
  // }

  // goBack(): void {
  //   this.router.navigate(['/']);
  // }
}
