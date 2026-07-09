import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  RecentStore,
  StoreActivityItem,
} from '../models/dashboard.model';
import {
  MOCK_RECENT_STORES,
  MOCK_STORE_ACTIVITY,
} from '../data/mock-dashboard.data';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  getRecentStores(): Observable<RecentStore[]> {
    return of(MOCK_RECENT_STORES).pipe(delay(400));
  }

  getStoreActivity(): Observable<StoreActivityItem[]> {
    return of(MOCK_STORE_ACTIVITY).pipe(delay(350));
  }
}
