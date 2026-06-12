import { ChangeDetectionStrategy, Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsightsFiltersComponent } from './components/insights-filters/insights-filters.component';
import { TopSearchedComponent } from './components/top-searched/top-searched.component';
import { OpportunitiesComponent } from './components/opportunities/opportunities.component';
import { PerformanceComponent } from './components/performance/performance.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    InsightsFiltersComponent,
    TopSearchedComponent,
    OpportunitiesComponent,
    PerformanceComponent
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent implements OnInit {
  // Filter state signals
  readonly selectedDistance = signal<string>('3 km');
  readonly selectedPeriod = signal<string>('30d');
  readonly loading = signal<boolean>(false);

  ngOnInit(): void {
    // Simulated page load API fetch
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
    }, 600);
  }

  /**
   * Top searched products nearby computed dynamically based on distance & duration
   */
  readonly topSearchedProducts = computed(() => {
    const distMul = this.getDistanceMultiplier(this.selectedDistance());
    const periodMul = this.getPeriodMultiplier(this.selectedPeriod());
    const multiplier = distMul * periodMul;

    const base = [
      { rank: 1, name: 'Portland Cement 50kg', category: 'Cement & Blocks', searches: 312, inStore: true },
      { rank: 2, name: 'PVC Pipe 3/4"', category: 'Plumbing', searches: 218, inStore: false },
      { rank: 3, name: 'Makita 18V Drill', category: 'Tools & Hardware', searches: 196, inStore: false },
      { rank: 4, name: 'M8 Hex Bolt Set', category: 'Tools & Hardware', searches: 145, inStore: false },
      { rank: 5, name: 'Impact Screwdriver', category: 'Tools & Hardware', searches: 98, inStore: true },
    ];

    const products = base.map(p => ({
      ...p,
      searches: Math.max(1, Math.round(p.searches * multiplier))
    }));

    const maxSearches = products[0].searches;

    return products.map(p => ({
      ...p,
      maxSearches
    }));
  });

  /**
   * Opportunities computed dynamically based on distance & duration
   */
  readonly opportunities = computed(() => {
    const distMul = this.getDistanceMultiplier(this.selectedDistance());
    const periodMul = this.getPeriodMultiplier(this.selectedPeriod());
    const multiplier = distMul * periodMul;

    const base = [
      { name: 'PVC Pipe 3/4"', category: 'Plumbing', searches: 218, description: 'no stores nearby stock this', icon: 'bi-wrench' },
      { name: 'Makita 18V Drill', category: 'Tools & Hardware', searches: 196, description: `1 store stocks it, ${Math.round(2.8 * distMul * 10) / 10} km away`, icon: 'bi-hammer' },
      { name: 'M8 Hex Bolt Set', category: 'Tools & Hardware', searches: 145, description: '3 stores stock it nearby', icon: 'bi-nut' },
      { name: 'LED Floodlight 50W', category: 'Electrical', searches: 87, description: 'no stores nearby stock this', icon: 'bi-lightbulb' }
    ];

    return base.map(o => ({
      ...o,
      searches: Math.max(1, Math.round(o.searches * multiplier))
    }));
  });

  /**
   * Listed product performance trends calculated based on active duration
   */
  readonly performanceProducts = computed(() => {
    const periodMul = this.getPeriodMultiplier(this.selectedPeriod());
    const multiplier = periodMul;

    const base = [
      { name: 'Portland Cement 50kg', impressions: 312, change: 24 },
      { name: 'Impact Screwdriver', impressions: 98, change: -8 }
    ];

    return base.map(p => ({
      ...p,
      impressions: Math.max(1, Math.round(p.impressions * multiplier))
    }));
  });

  onDistanceChange(distance: string): void {
    if (this.selectedDistance() === distance) return;
    this.selectedDistance.set(distance);
    this.triggerFilterLoading();
  }

  onPeriodChange(period: string): void {
    if (this.selectedPeriod() === period) return;
    this.selectedPeriod.set(period);
    this.triggerFilterLoading();
  }

  private triggerFilterLoading(): void {
    // Simulated filter query API fetch
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
    }, 400);
  }

  /**
   * Multipliers helper for local queries simulation
   */
  private getDistanceMultiplier(distance: string): number {
    switch (distance) {
      case '1 km': return 0.35;
      case '3 km': return 1.0;
      case '5 km': return 1.7;
      case '10 km': return 2.9;
      case '25 km': return 5.5;
      default: return 1.0;
    }
  }

  private getPeriodMultiplier(period: string): number {
    switch (period) {
      case '7d': return 0.24;
      case '30d': return 1.0;
      case '90d': return 2.95;
      default: return 1.0;
    }
  }
}
