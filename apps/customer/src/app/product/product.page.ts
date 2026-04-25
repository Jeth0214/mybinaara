import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { SearchProduct } from '../core/models/search-product.model';
import { ProductDetail } from '../core/models/product-detail.model';
import { MOCK_SEARCH_PRODUCTS } from '../core/data/mock-search-products.data';
import { MOCK_PRODUCT_DETAILS } from '../core/data/mock-product-details.data';
import { MOCK_STORES } from '../core/data/mock-stores.data';
import { LocationService } from '../shared/services/location.service';
import { RecentViewsService } from '../shared/services/recent-views.service';
import { Store } from '../core/models/store.model';

type ProductView = SearchProduct & ProductDetail;

interface StoreAvail {
  store: Store;
  stock: number;
  distanceKm: number | null;
}

@Component({
  selector: 'app-product',
  templateUrl: 'product.page.html',
  styleUrls: ['product.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonButtons, IonIcon],
})
export class ProductPage implements OnInit {
  private route = inject(ActivatedRoute);
  private locationNav = inject(Location);
  private locationService = inject(LocationService);
  private recentViews = inject(RecentViewsService);

  productView = signal<ProductView | null>(null);
  saved = signal<boolean>(false);

  storesWithAvailability = computed<StoreAvail[]>(() => {
    const pv = this.productView();
    if (!pv) return [];
    const coords = this.locationService.coords();
    return pv.availableAt
      .map((avail) => {
        const store = MOCK_STORES.find((s) => s.id === avail.storeId);
        if (!store) return null;
        return {
          store,
          stock: avail.stock,
          distanceKm: coords
            ? this.locationService.calculateDistance(coords.lat, coords.lng, store.lat, store.lng)
            : null,
        };
      })
      .filter((s): s is StoreAvail => s !== null)
      .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const sp = MOCK_SEARCH_PRODUCTS.find((p) => p.id === id);
    const pd = MOCK_PRODUCT_DETAILS.find((d) => d.id === id);
    if (sp && pd) {
      this.productView.set({ ...sp, ...pd });
      this.recentViews.add(sp);
    }
  }

  goBack() {
    this.locationNav.back();
  }

  toggleSaved() {
    this.saved.update((v) => !v);
  }

  private readonly CATEGORY_ICONS: Record<string, string> = {
    Cement: 'cube-outline',
    Glass: 'apps-outline',
    Steel: 'cut-outline',
    Wood: 'leaf-outline',
    Paint: 'color-palette-outline',
    Tiles: 'grid-outline',
  };

  getCategoryIcon(category: string): string {
    return this.CATEGORY_ICONS[category] ?? 'cube-outline';
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  formatDistance(km: number | null): string {
    return km !== null ? `${km} km` : '—';
  }
}
