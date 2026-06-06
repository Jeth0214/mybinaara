import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonButtons, IonIcon, IonTitle } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
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
  imports: [IonTitle, IonContent, IonHeader, IonToolbar, IonButtons, IonIcon],
})
export class ProductPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
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

  navigateToStore(storeId: string) {
    this.router.navigate(['/store', storeId]);
  }

  toggleSaved() {
    this.saved.update((v) => !v);
  }

  private readonly CATEGORY_ICONS: Record<string, string> = {
    'Building Materials': '/assets/categories/building-materials.svg',
    'Cement & Blocks': '/assets/categories/cement-and-blocks.svg',
    'Steel & Metal': '/assets/categories/steel-and-metal.svg',
    'Doors & Windows': '/assets/categories/doors-and-windows.svg',
    'Paint & Finishes': '/assets/categories/paints-and-finishes.svg',
    'Electrical': '/assets/categories/electrical.svg',
    'Plumbing': '/assets/categories/plumbing.svg',
    'HVAC & Air Conditioning': '/assets/categories/hvac-and-air-conditioning.svg',
    'Wood & Carpentry': '/assets/categories/wood-and-carpentry.svg',
    'Roofing': '/assets/categories/roofing.svg',
    'Flooring & Tiles': '/assets/categories/flooring-and-tiles.svg',
    'Glass & Aluminum': '/assets/categories/glass-and-aluminum.svg',
    'Waterproofing': '/assets/categories/waterproofing.svg',
    'Tools & Hardware': '/assets/categories/tools-and-hardware.svg',
    'Equipment & Machinery': '/assets/categories/equipments-and-machinery.svg',
    'Safety Supplies': '/assets/categories/safety-supplies.svg',
    'Landscaping': '/assets/categories/landscaping.svg',
    'Miscellaneous': '/assets/categories/miscellaneous.svg',
  };

  getCategoryIcon(category: string): string {
    return this.CATEGORY_ICONS[category] ?? '/assets/categories/miscellaneous.svg';
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  formatDistance(km: number | null): string {
    return km !== null ? `${km} km` : '—';
  }
}
