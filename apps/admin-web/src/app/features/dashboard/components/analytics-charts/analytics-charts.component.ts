import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-analytics-charts',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row g-4">
      <!-- Bar Chart: Merchant Distribution by City (8/12) -->
      <div class="col-lg-8 col-md-12">
        <div class="card border-0 shadow-sm h-100 p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="mb-0 fw-bold text-dark">Merchant Distribution by City</h6>
            <span class="badge bg-success bg-opacity-10 text-success fw-bold fs-8-5">KSA Branches</span>
          </div>
          <div class="chart-container relative" style="height: 300px;">
            <canvas
              baseChart
              [data]="barChartData"
              [options]="barChartOptions"
              [type]="'bar'"
            ></canvas>
          </div>
        </div>
      </div>

      <!-- Doughnut Chart: Category share (4/12) -->
      <div class="col-lg-4 col-md-12">
        <div class="card border-0 shadow-sm h-100 p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="mb-0 fw-bold text-dark">Category Share</h6>
            <span class="badge bg-primary bg-opacity-10 text-primary fw-bold fs-8-5">Active Products</span>
          </div>
          <div class="chart-container relative" style="height: 300px;">
            <canvas
              baseChart
              [data]="doughnutChartData"
              [options]="doughnutChartOptions"
              [type]="'doughnut'"
            ></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AnalyticsChartsComponent implements OnInit {
  
  // ── STORES BAR CHART CONFIGURATION ──────────────────────────────────────
  readonly barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'],
    datasets: [
      {
        data: [42, 28, 15, 10, 8],
        label: 'Stores Count',
        backgroundColor: '#2d7a4f',
        hoverBackgroundColor: '#1a3f22',
        borderRadius: 6,
      }
    ]
  };

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

  // ── DOUGHNUT CHART CONFIGURATION ───────────────────────────────────────
  readonly doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Building Materials', 'Electrical', 'Plumbing', 'HVAC & Air Conditioning', 'Tools & Hardware'],
    datasets: [
      {
        data: [45, 88, 62, 29, 104],
        backgroundColor: [
          '#2d7a4f', // green
          '#007bff', // blue
          '#17a2b8', // cyan/info
          '#fd7e14', // orange/warning
          '#6f42c1'  // purple
        ],
        hoverOffset: 4
      }
    ]
  };

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

  ngOnInit(): void {}
}
