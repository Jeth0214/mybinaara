import { Component, signal, computed, inject, effect, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonButtons, IonIcon, IonTitle } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogProduct } from '../core/models/catalog-product.model';
import { ProductListing } from '../core/models/product-listing.model';
import { LocationService } from '../shared/services/location.service';
import { ProductService } from '../shared/services/product.service';
import { RecentViewsService } from '../shared/services/recent-views.service';

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
  private productService = inject(ProductService);
  private recentViews = inject(RecentViewsService);

  product = signal<CatalogProduct | null>(null);
  loading = signal<boolean>(true);
  error = signal<boolean>(false);

  listings = signal<ProductListing[]>([]);
  listingsLoading = signal<boolean>(false);

  sortMode = signal<'distance' | 'price_asc' | 'price_desc'>('distance');

  sortedListings = computed<ProductListing[]>(() => {
    const items = [...this.listings()];
    switch (this.sortMode()) {
      case 'price_asc':
        return items.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return items.sort((a, b) => b.price - a.price);
      default:
        return items; // already distance-sorted by the backend
    }
  });

  private id = 0;

  constructor() {
    effect(() => {
      const coords = this.locationService.coords();
      if (coords && this.id) {
        this.listingsLoading.set(true);
        this.productService.getListings(this.id, coords.lat, coords.lng).subscribe({
          next: (listings) => {
            this.listings.set(listings);
            this.listingsLoading.set(false);
          },
          error: () => this.listingsLoading.set(false),
        });
      }
    });
  }

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.productService.getById(this.id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
        this.recentViews.add({
          id: product.id,
          name: product.name,
          category: product.category?.name ?? '',
          image_url: product.image_url,
          storeCount: product.listings_count,
        });
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  goBack() {
    this.locationNav.back();
  }

  navigateToStore(storeId: number) {
    this.router.navigate(['/store', storeId]);
  }

  cycleSortMode(): void {
    this.sortMode.update((mode) =>
      mode === 'distance' ? 'price_asc' : mode === 'price_asc' ? 'price_desc' : 'distance'
    );
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  formatDistance(km: number | null): string {
    return km !== null ? `${km} km` : '—';
  }
}
