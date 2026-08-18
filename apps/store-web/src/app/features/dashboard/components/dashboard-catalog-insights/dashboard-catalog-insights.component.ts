import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { StoreDashboardCategoryCount } from '../../../../core/models/store-dashboard.model';

Chart.register(...registerables);

const CATEGORY_COLORS = ['#2d7a4f', '#007bff', '#17a2b8', '#fd7e14', '#6f42c1', '#adb5bd'];

@Component({
  selector: 'app-dashboard-catalog-insights',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard-catalog-insights.component.html',
  styleUrl: './dashboard-catalog-insights.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCatalogInsightsComponent {
  activeCount = input<number>(0);
  suspendedCount = input<number>(0);
  byCategory = input<StoreDashboardCategoryCount[]>([]);

  readonly hasCategories = computed(() => this.byCategory().length > 0);

  /** Top 5 categories by count, with the rest folded into "Other" so the
   *  legend stays readable for stores with a large, spread-out catalog. */
  private readonly categoryShare = computed(() => {
    const sorted = [...this.byCategory()].sort((a, b) => b.count - a.count);
    const top = sorted.slice(0, 5);
    const otherTotal = sorted.slice(5).reduce((sum, c) => sum + c.count, 0);

    const entries: Array<[string, number]> = top.map((c) => [c.name, c.count]);
    if (otherTotal > 0) {
      entries.push(['Other', otherTotal]);
    }
    return entries;
  });

  readonly pieChartData = computed<ChartConfiguration<'pie'>['data']>(() => {
    const entries = this.categoryShare();
    return {
      labels: entries.map(([name]) => name),
      datasets: [
        {
          data: entries.map(([, count]) => count),
          backgroundColor: CATEGORY_COLORS,
          hoverOffset: 4,
        },
      ],
    };
  });

  readonly pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 12,
          color: '#1c2319',
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.parsed}`,
        },
      },
    },
  };
}
