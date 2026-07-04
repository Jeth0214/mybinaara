import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { UserCatalogService } from '../../../core/services/user-catalog.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/catalog.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatPaginatorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-4" style="max-width: 1200px;">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold mb-1">Master Product Catalog</h4>
          <p class="text-muted mb-0">Browse all store-submitted items and monitor product database entries</p>
        </div>
        <a routerLink="../approvals" class="btn btn-success d-flex align-items-center gap-2">
          <i class="bi bi-check2-square"></i>
          <span>Approval Queue</span>
          @if (pendingCount() > 0) {
            <span class="badge bg-danger rounded-pill">{{ pendingCount() }}</span>
          }
        </a>
      </div>

      <!-- Filters Card -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-3">
          <div class="row g-3">
            <!-- Search -->
            <div class="col-lg-5 col-md-6">
              <div class="input-group">
                <span class="input-group-text bg-transparent border-end-0 text-muted">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0 ps-2"
                  [ngModel]="searchQuery()"
                  (ngModelChange)="searchQuery.set($event)"
                />
              </div>
            </div>

             <!-- Category Filter -->
            <div class="col-lg-3 col-md-3 col-6">
              <select
                class="form-select"
                [ngModel]="categoryFilter()"
                (ngModelChange)="categoryFilter.set($event)"
              >
                <option value="all">All Categories</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.name">{{ cat.name }}</option>
                }
              </select>
            </div>

            <!-- Approval Status Filter -->
            <div class="col-lg-4 col-md-3 col-6">
              <select
                class="form-select"
                [ngModel]="statusFilter()"
                (ngModelChange)="statusFilter.set($event)"
              >
                <option value="all">All Approval States</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card border-0 shadow-sm overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="table-light text-uppercase fs-8 fw-semibold text-muted">
              <tr>
                <th scope="col" class="ps-4">Product / SKU Details</th>
                <th scope="col">Store Vendor</th>
                <th scope="col">Category</th>
                <th scope="col">Brand</th>
                <th scope="col">Price</th>
                <th scope="col">Approval Status</th>
                <th scope="col" class="text-end pe-4">Inspection</th>
              </tr>
            </thead>
            <tbody>
              @for (prod of paginatedProducts(); track prod.id) {
                <tr>
                  <td class="ps-4 py-3">
                    <div class="d-flex align-items-center gap-3">
                      <!-- Mock Thumbnail Icon -->
                      <div class="product-thumb bg-light rounded text-muted d-flex align-items-center justify-content-center">
                        <i class="bi bi-box-seam fs-5"></i>
                      </div>
                      <div>
                        <h6 class="mb-0 fw-semibold fs-7-5">{{ prod.name }}</h6>
                        <span class="fs-8 text-muted d-block font-monospace">SKU: {{ prod.sku }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="text-dark fw-medium fs-7-5">{{ prod.storeName }}</span>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark fw-medium">{{ prod.category }}</span>
                  </td>
                  <td>
                    <span class="text-secondary fw-semibold fs-7-5">{{ prod.brand }}</span>
                  </td>
                  <td>
                    <strong class="text-success fs-7-5">{{ prod.price | number:'1.2-2' }} SAR</strong>
                  </td>
                  <td>
                    <span [class]="'status-badge status-badge--' + (prod.status === 'approved' ? 'active' : prod.status === 'pending' ? 'pending' : 'rejected')">
                      {{ prod.status }}
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    <a
                      routerLink="../approvals"
                      class="btn btn-outline-secondary btn-sm fs-8 fw-semibold"
                      title="Inspect Product"
                    >
                      Inspect
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-box-seam fs-2 d-block mb-3 opacity-30"></i>
                    <p class="mb-0 fw-medium">No catalog entries matched your search query</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (filteredProducts().length > 0) {
          <mat-paginator
            [length]="filteredProducts().length"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[5, 10, 25, 50, 100]"
            [pageIndex]="pageIndex()"
            (page)="handlePageEvent($event)"
            aria-label="Select page"
            class="border-top"
          />
        }
      </div>
    </div>
  `,
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
      tbody tr:hover {
        background-color: #fcfdfa;
      }
    }
  `]
})
export class ProductListComponent {
  private readonly userCatalogService = inject(UserCatalogService);

  readonly searchQuery = signal('');
  readonly categoryFilter = signal('all');
  readonly statusFilter = signal('all');

  // Pagination Signals
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);

  readonly categories = this.userCatalogService.categories;
  readonly allProducts = this.userCatalogService.products;
  readonly pendingCount = computed(() => this.userCatalogService.pendingProducts().length);

  constructor() {
    // Reset page index on filter change
    effect(() => {
      this.searchQuery();
      this.categoryFilter();
      this.statusFilter();
      
      untracked(() => {
        this.pageIndex.set(0);
      });
    });
  }

  readonly filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.categoryFilter();
    const status = this.statusFilter();

    return this.allProducts().filter(prod => {
      const matchesSearch = !query ||
        prod.name.toLowerCase().includes(query) ||
        prod.sku.toLowerCase().includes(query) ||
        prod.brand.toLowerCase().includes(query) ||
        prod.storeName.toLowerCase().includes(query);

      const matchesCategory = category === 'all' || prod.category === category;
      const matchesStatus = status === 'all' || prod.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  });

  readonly paginatedProducts = computed(() => {
    const list = this.filteredProducts();
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return list.slice(start, end);
  });

  handlePageEvent(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }
}
