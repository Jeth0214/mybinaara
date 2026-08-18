import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { StoreDashboardDailyCount } from '../../../../core/models/store-dashboard.model';

Chart.register(...registerables);

const TREND_DAYS = 30;

@Component({
  selector: 'app-dashboard-trend-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard-trend-chart.component.html',
  styleUrl: './dashboard-trend-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardTrendChartComponent {
  addedOverTime = input<StoreDashboardDailyCount[]>([]);

  /** Backend only returns days that had at least one product added; fill in
   *  the gaps so the line covers a continuous 30-day window instead of
   *  jumping between sparse points. */
  private readonly dailySeries = computed(() => {
    const countByDate = new Map(this.addedOverTime().map((entry) => [entry.date, entry.count]));
    const days: { date: string; count: number }[] = [];

    for (let i = TREND_DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push({ date: iso, count: countByDate.get(iso) ?? 0 });
    }

    return days;
  });

  readonly hasActivity = computed(() => this.addedOverTime().length > 0);

  readonly lineChartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const days = this.dailySeries();
    return {
      labels: days.map((d) => this.formatLabel(d.date)),
      datasets: [
        {
          data: days.map((d) => d.count),
          label: 'Products Added',
          borderColor: '#2d7a4f',
          backgroundColor: 'rgba(45, 122, 79, 0.1)',
          pointBackgroundColor: '#2d7a4f',
          pointRadius: 2,
          fill: true,
          tension: 0.3,
        },
      ],
    };
  });

  readonly lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => ` Added: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#6c757d', precision: 0 },
        grid: { color: '#e2e6df' },
      },
      x: {
        ticks: { color: '#6c757d', maxTicksLimit: 8 },
        grid: { display: false },
      },
    },
  };

  private formatLabel(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
}
