import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { StoreService } from '../../../../core/services/store.service';
import { UserCatalogService } from '../../../../core/services/user-catalog.service';

// Register all Chart.js components
Chart.register(...registerables);

const CATEGORY_COLORS = ['#2d7a4f', '#007bff', '#17a2b8', '#fd7e14', '#6f42c1', '#adb5bd'];

@Component({
  selector: 'app-analytics-charts',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './analytics-charts.component.html',
  styleUrl: './analytics-charts.component.scss',
})
export class AnalyticsChartsComponent {
  private readonly storeService = inject(StoreService);
  private readonly userCatalogService = inject(UserCatalogService);

  // ── STORES BAR CHART: live count of stores per city ─────────────────────
  private readonly cityDistribution = computed(() => {
    const counts = new Map<string, number>();
    for (const store of this.storeService.stores()) {
      const city = store.location.city || 'Unknown';
      counts.set(city, (counts.get(city) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  });

  readonly barChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const dist = this.cityDistribution();
    return {
      labels: dist.map(([city]) => city),
      datasets: [
        {
          data: dist.map(([, count]) => count),
          label: 'Stores Count',
          backgroundColor: '#2d7a4f',
          hoverBackgroundColor: '#1a3f22',
          borderRadius: 6,
        }
      ]
    };
  });

  readonly barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return ` Stores: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: '#e2e6df'
        },
        ticks: {
          color: '#6c757d',
          stepSize: 10
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6c757d'
        }
      }
    }
  };

  // ── DOUGHNUT CHART: live product count per category (top 5 + Other) ─────
  private readonly categoryShare = computed(() => {
    const sorted = [...this.userCatalogService.categories()].sort((a, b) => b.productCount - a.productCount);
    const top = sorted.slice(0, 5);
    const otherTotal = sorted.slice(5).reduce((sum, cat) => sum + cat.productCount, 0);

    const entries: Array<[string, number]> = top.map(cat => [cat.name, cat.productCount]);
    if (otherTotal > 0) {
      entries.push(['Other', otherTotal]);
    }
    return entries;
  });

  readonly doughnutChartData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const entries = this.categoryShare();
    return {
      labels: entries.map(([name]) => name),
      datasets: [
        {
          data: entries.map(([, count]) => count),
          backgroundColor: CATEGORY_COLORS,
          hoverOffset: 4
        }
      ]
    };
  });

  readonly doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          color: '#1c2319',
          font: {
            size: 11
          }
        }
      }
    }
  };
}
