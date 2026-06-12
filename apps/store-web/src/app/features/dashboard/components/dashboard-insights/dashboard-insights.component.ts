import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface SearchOpportunity {
  name: string;
  searches: number;
  gapText: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-insights',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-insights.component.html',
  styleUrl: './dashboard-insights.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardInsightsComponent {
  readonly totalImpressions = 312;
  readonly topCategory = 'Cement & Blocks';

  readonly opportunities: SearchOpportunity[] = [
    {
      name: 'PVC Pipe 3/4"',
      searches: 218,
      gapText: 'No local stores stock this nearby',
      icon: 'bi-wrench',
    },
    {
      name: 'Makita 18V Drill',
      searches: 196,
      gapText: '1 store stocks it, 2.8 km away',
      icon: 'bi-hammer',
    },
  ];
}
