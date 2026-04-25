import { Injectable, signal } from '@angular/core';
import { RecentSearchProduct } from '../../core/models/recent-search.model';
import { SearchProduct } from '../../core/models/search-product.model';

@Injectable({ providedIn: 'root' })
export class RecentViewsService {
  private readonly STORAGE_KEY = 'mybinaara_recent_views';
  private readonly MAX_ITEMS = 5;

  readonly recentViews = signal<RecentSearchProduct[]>(this.load());

  add(product: SearchProduct): void {
    const current = this.recentViews();
    if (current.some((p) => p.id === product.id)) return;
    const updated = [
      {
        id: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        iconBg: product.iconBg,
        storeCount: product.storeCount,
        viewedAt: new Date(),
      },
      ...current,
    ].slice(0, this.MAX_ITEMS);
    this.recentViews.set(updated);
    this.save(updated);
  }

  private load(): RecentSearchProduct[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw).map((p: RecentSearchProduct) => ({
        ...p,
        viewedAt: new Date(p.viewedAt),
      }));
    } catch {
      return [];
    }
  }

  private save(items: RecentSearchProduct[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }
}
