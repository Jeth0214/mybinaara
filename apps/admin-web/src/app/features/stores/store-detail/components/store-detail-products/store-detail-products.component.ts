import { ChangeDetectionStrategy, Component, inject, input, computed, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Store } from '../../../../../core/models/store.model';
import { UserCatalogService } from '../../../../../core/services/user-catalog.service';

@Component({
  selector: 'app-store-detail-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-detail-products.component.html',
  styles: [`
    .fs-8 {
      font-size: 0.72rem;
      letter-spacing: 0.02rem;
    }
    .product-thumb {
      width: 44px;
      height: 44px;
      border: 1px solid var(--brand-border);
    }
    .custom-table {
      tr {
        transition: background-color 0.15s ease;
      }
    }
  `]
})
export class StoreDetailProductsComponent {
  readonly store = input.required<Store>();

  private readonly catalogService = inject(UserCatalogService);

  getCategoryIcon(category: string): string {
    const mapping: { [key: string]: string } = {
      'Building Materials': 'building-materials.svg',
      'Cement & Blocks': 'cement-and-blocks.svg',
      'Steel & Metal': 'steel-and-metal.svg',
      'Doors & Windows': 'doors-and-windows.svg',
      'Paint & Finishes': 'paints-and-finishes.svg',
      'Electrical': 'electrical.svg',
      'Plumbing': 'plumbing.svg',
      'HVAC & Air Conditioning': 'hvac-and-air-conditioning.svg',
      'Wood & Carpentry': 'wood-and-carpentry.svg',
      'Roofing': 'roofing.svg',
      'Flooring & Tiles': 'flooring-and-tiles.svg',
      'Glass & Aluminum': 'glass-and-aluminum.svg',
      'Waterproofing': 'waterproofing.svg',
      'Tools & Hardware': 'tools-and-hardware.svg',
      'Equipment & Machinery': 'equipments-and-machinery.svg',
      'Safety Supplies': 'safety-supplies.svg',
      'Landscaping': 'landscaping.svg',
      'Miscellaneous': 'miscellaneous.svg'
    };
    const filename = mapping[category] || 'miscellaneous.svg';
    return `/images/category-icons/${filename}`;
  }

  readonly pageSize = signal(5);
  readonly pageIndex = signal(0);
  readonly productsLoaded = signal(false);

  // Search & Filter State
  readonly searchQuery = signal('');
  readonly statusFilter = signal('all');
  readonly categoryFilter = signal('all');

  // Categories list
  readonly categories = this.catalogService.categories;

  // Filter products by current store ID, search query, category, and status
  readonly filteredStoreProducts = computed(() => {
    const s = this.store();
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const cat = this.categoryFilter();

    let list = this.catalogService.products().filter(p => p.storeId === s.id);

    if (query) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
      );
    }

    if (status !== 'all') {
      list = list.filter(p => (status === 'suspended' ? p.isSuspended : !p.isSuspended));
    }

    if (cat !== 'all') {
      list = list.filter(p => p.category === cat);
    }

    return list;
  });

  // Apply pagination over filtered products
  readonly paginatedProducts = computed(() => {
    const prods = this.filteredStoreProducts();
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return prods.slice(start, end);
  });

  constructor() {
    // Reset pageIndex and productsLoaded back to default if the active store record changes
    effect(() => {
      const _ = this.store();
      untracked(() => {
        this.pageIndex.set(0);
        this.productsLoaded.set(false);
        this.searchQuery.set('');
        this.statusFilter.set('all');
        this.categoryFilter.set('all');
      });
    });
  }

  loadProducts(): void {
    this.productsLoaded.set(true);
  }

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
    this.pageIndex.set(0);
  }

  onCategoryChange(val: string): void {
    this.categoryFilter.set(val);
    this.pageIndex.set(0);
  }

  onStatusChange(val: string): void {
    this.statusFilter.set(val);
    this.pageIndex.set(0);
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }
}
