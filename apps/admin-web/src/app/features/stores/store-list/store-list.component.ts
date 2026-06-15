import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../core/services/store.service';
import { ToastService } from '../../../core/services/toast.service';
import { Store, StoreStatus, SAUDI_CITIES, STORE_CATEGORIES } from '../../../core/models/store.model';

@Component({
  selector: 'app-store-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-4" style="max-width: 1200px;">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold mb-1">Store & Vendor Directory</h4>
          <p class="text-muted mb-0">Manage registered merchant accounts, verification status, and plans in Saudi Arabia</p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="verification" class="btn btn-outline-success d-flex align-items-center gap-2">
            <i class="bi bi-shield-check"></i>
            <span>Verification Queue</span>
            @if (pendingCount() > 0) {
              <span class="badge bg-danger rounded-pill">{{ pendingCount() }}</span>
            }
          </a>
          <a routerLink="create" class="btn btn-success d-flex align-items-center gap-2">
            <i class="bi bi-plus-lg"></i>
            <span>Add New Store</span>
          </a>
        </div>
      </div>

      <!-- Filters Card -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-3">
          <div class="row g-3">
            <!-- Search -->
            <div class="col-lg-4 col-md-6">
              <div class="input-group">
                <span class="input-group-text bg-transparent border-end-0 text-muted">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0 ps-0"
                  placeholder="Search store name, CR, owner..."
                  [ngModel]="searchQuery()"
                  (ngModelChange)="searchQuery.set($event)"
                />
              </div>
            </div>

            <!-- Status Filter -->
            <div class="col-lg-2 col-md-6 col-6">
              <select
                class="form-select"
                [ngModel]="statusFilter()"
                (ngModelChange)="statusFilter.set($event)"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <!-- Category Filter -->
            <div class="col-lg-3 col-md-6 col-6">
              <select
                class="form-select"
                [ngModel]="categoryFilter()"
                (ngModelChange)="categoryFilter.set($event)"
              >
                <option value="all">All Categories</option>
                @for (cat of categories; track cat.value) {
                  <option [value]="cat.value">{{ cat.label }}</option>
                }
              </select>
            </div>

            <!-- City Filter -->
            <div class="col-lg-3 col-md-6">
              <select
                class="form-select"
                [ngModel]="cityFilter()"
                (ngModelChange)="cityFilter.set($event)"
              >
                <option value="all">All Saudi Cities</option>
                @for (city of cities; track city.value) {
                  <option [value]="city.value">{{ city.label }}</option>
                }
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card border-0 shadow-sm overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="table-light text-uppercase fs-7 fw-semibold text-muted">
              <tr>
                <th scope="col" class="ps-4">Store details</th>
                <th scope="col">Category</th>
                <th scope="col">CR Number</th>
                <th scope="col">Owner Info</th>
                <th scope="col">Subscription</th>
                <th scope="col">Status</th>
                <th scope="col" class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (store of filteredStores(); track store.id) {
                <tr>
                  <td class="ps-4 py-3">
                    <div class="d-flex align-items-center gap-3">
                      <div class="avatar avatar--circle avatar--success">
                        <span>{{ store.name.charAt(0) }}</span>
                      </div>
                      <div>
                        <h6 class="mb-0 fw-semibold">
                          <a [routerLink]="[store.id]" class="text-decoration-none text-dark hover-success">
                            {{ store.name }}
                          </a>
                        </h6>
                        <span class="fs-7 text-muted d-flex align-items-center gap-1 mt-0.5">
                          <i class="bi bi-geo-alt"></i> {{ store.location }}, Saudi Arabia
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark fw-medium">{{ store.category }}</span>
                  </td>
                  <td>
                    <code class="text-secondary font-monospace">{{ store.crNumber }}</code>
                  </td>
                  <td>
                    <div class="fs-7">
                      <div class="fw-medium text-dark">{{ store.ownerName }}</div>
                      <div class="text-muted fs-8">{{ store.ownerPhone }}</div>
                    </div>
                  </td>
                  <td>
                    <select
                      class="form-select form-select-sm border-0 bg-light fw-semibold fs-7"
                      style="width: 120px;"
                      [value]="store.subscriptionPlanId"
                      (change)="changePlan(store.id, $event)"
                    >
                      <option value="basic">Basic (Free)</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </td>
                  <td>
                    <span [class]="'status-badge status-badge--' + store.status">
                      {{ store.status }}
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    <div class="d-flex justify-content-end gap-1">
                      <a [routerLink]="[store.id]" class="btn btn-icon-btn btn-sm" title="View Store">
                        <i class="bi bi-eye text-primary"></i>
                      </a>
                      
                      @if (store.status === 'active') {
                        <button
                          class="btn btn-icon-btn btn-sm"
                          (click)="toggleStatus(store)"
                          title="Suspend Store"
                        >
                          <i class="bi bi-slash-circle text-danger"></i>
                        </button>
                      } @else if (store.status === 'suspended') {
                        <button
                          class="btn btn-icon-btn btn-sm"
                          (click)="toggleStatus(store)"
                          title="Activate Store"
                        >
                          <i class="bi bi-check-circle text-success"></i>
                        </button>
                      } @else if (store.status === 'pending') {
                        <a
                          [routerLink]="['verification']"
                          class="btn btn-icon-btn btn-sm"
                          title="Verify Documents"
                        >
                          <i class="bi bi-shield-check text-warning"></i>
                        </a>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-shop-window fs-2 d-block mb-3 opacity-30"></i>
                    <p class="mb-0 fw-medium">No stores found matching your filters</p>
                    <small>Try adjusting search queries or category filters.</small>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hover-success:hover {
      color: var(--brand-green) !important;
    }

    .fs-7 {
      font-size: 0.825rem;
    }

    .fs-8 {
      font-size: 0.75rem;
    }

    // Avatar styling inside component
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      background: rgba(45, 122, 79, 0.1);
      color: var(--brand-green);
    }

    .custom-table {
      tr {
        transition: background-color 0.15s ease;
      }
      tbody tr:hover {
        background-color: #fcfdfa;
      }
      th {
        font-size: 0.72rem;
        letter-spacing: 0.05rem;
        padding-top: 12px;
        padding-bottom: 12px;
      }
    }
  `]
})
export class StoreListComponent {
  private readonly storeService = inject(StoreService);
  private readonly toast = inject(ToastService);

  readonly cities = SAUDI_CITIES;
  readonly categories = STORE_CATEGORIES;

  // Signal filters
  readonly searchQuery = signal('');
  readonly statusFilter = signal('all');
  readonly categoryFilter = signal('all');
  readonly cityFilter = signal('all');

  // Master reactive data from service
  readonly allStores = this.storeService.stores;

  // Computed list of pending verifications for indicator
  readonly pendingCount = computed(() => 
    this.allStores().filter(s => s.status === 'pending').length
  );

  // Signal-based filtering logic
  readonly filteredStores = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const category = this.categoryFilter();
    const city = this.cityFilter();

    return this.allStores().filter((store) => {
      // 1. Search filter
      const matchesSearch = !query || 
        store.name.toLowerCase().includes(query) ||
        store.crNumber.includes(query) ||
        store.ownerName.toLowerCase().includes(query) ||
        store.ownerEmail.toLowerCase().includes(query);

      // 2. Status filter
      const matchesStatus = status === 'all' || store.status === status;

      // 3. Category filter
      const matchesCategory = category === 'all' || store.category === category;

      // 4. City filter
      const matchesCity = city === 'all' || store.location === city;

      return matchesSearch && matchesStatus && matchesCategory && matchesCity;
    });
  });

  toggleStatus(store: Store): void {
    const newStatus: StoreStatus = store.status === 'active' ? 'suspended' : 'active';
    this.storeService.updateStoreStatus(store.id, newStatus);
    
    if (newStatus === 'active') {
      this.toast.success(`Store "${store.name}" activated successfully.`);
    } else {
      this.toast.warning(`Store "${store.name}" has been suspended.`);
    }
  }

  changePlan(storeId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const planId = target.value as 'basic' | 'premium' | 'enterprise';
    this.storeService.assignSubscriptionPlan(storeId, planId);
    
    const storeName = this.storeService.getStoreById(storeId)?.name || 'Store';
    this.toast.success(`Plan updated to "${planId}" for ${storeName}.`);
  }
}
