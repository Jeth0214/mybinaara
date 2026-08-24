import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardCharts } from '../../../../core/models/dashboard.model';

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
  readonly charts = input.required<DashboardCharts>();

  // ── STORES BAR CHART: live count of stores per city ─────────────────────
  readonly barChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const dist = this.charts().storesByCity;
    return {
      labels: dist.map((entry) => entry.city),
      datasets: [
        {
          data: dist.map((entry) => entry.count),
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
    const sorted = [...this.charts().categoryShare].sort((a, b) => b.productCount - a.productCount);
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
