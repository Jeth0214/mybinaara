import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  DashboardStats,
  RecentStore,
  StoreActivityItem,
  GrowthMetric,
} from '../models/dashboard.model';
import {
  MOCK_DASHBOARD_STATS,
  MOCK_RECENT_STORES,
  MOCK_STORE_ACTIVITY,
  MOCK_GROWTH_METRICS,
} from '../data/mock-dashboard.data';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  getStats(): Observable<DashboardStats> {
    return of(MOCK_DASHBOARD_STATS).pipe(delay(300));
  }

  getRecentStores(): Observable<RecentStore[]> {
    return of(MOCK_RECENT_STORES).pipe(delay(400));
  }

  getStoreActivity(): Observable<StoreActivityItem[]> {
    return of(MOCK_STORE_ACTIVITY).pipe(delay(350));
  }

  getGrowthMetrics(): Observable<GrowthMetric[]> {
    return of(MOCK_GROWTH_METRICS).pipe(delay(300));
  }
}
