import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserCatalogService } from '../../../core/services/user-catalog.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomerAccount, UserStatus } from '../../../core/models/user.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-4" style="max-width: 1200px;">
      <!-- Header -->
      <div class="mb-4">
        <h4 class="fw-bold mb-1">Customer & Contractor Management</h4>
        <p class="text-muted mb-0">Monitor consumer accounts, contractor company registries, and suspend accounts if needed</p>
      </div>

      <!-- Filters & Tabs Grid -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-3 d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
          <!-- Type Tabs -->
          <div class="btn-group" role="group">
            <button
              type="button"
              class="btn btn-outline-success"
              [class.active]="selectedTab() === 'all'"
              (click)="selectedTab.set('all')"
            >
              All Accounts
            </button>
            <button
              type="button"
              class="btn btn-outline-success"
              [class.active]="selectedTab() === 'customer'"
              (click)="selectedTab.set('customer')"
            >
              Consumers
            </button>
            <button
              type="button"
              class="btn btn-outline-success"
              [class.active]="selectedTab() === 'contractor'"
              (click)="selectedTab.set('contractor')"
            >
              Contractors
            </button>
          </div>

          <!-- Search Input -->
          <div style="max-width: 380px; width: 100%;">
            <div class="input-group">
              <span class="input-group-text bg-transparent border-end-0 text-muted">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0 ps-0"
                placeholder="Search name, email, company..."
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Listing Table -->
      <div class="card border-0 shadow-sm overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="table-light text-uppercase fs-8 fw-semibold text-muted">
              <tr>
                <th scope="col" class="ps-4">User Details</th>
                <th scope="col">Account Type</th>
                <th scope="col">Company Registry</th>
                <th scope="col">Joined Date</th>
                <th scope="col">Status</th>
                <th scope="col" class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of filteredAccounts(); track user.id) {
                <tr>
                  <td class="ps-4 py-3">
                    <div class="d-flex align-items-center gap-3">
                      <div
                        class="avatar-circle font-weight-bold"
                        [class]="user.type === 'contractor' ? 'avatar-circle--contractor' : 'avatar-circle--customer'"
                      >
                        {{ user.name.charAt(0) }}
                      </div>
                      <div>
                        <h6 class="mb-0 fw-semibold">{{ user.name }}</h6>
                        <span class="fs-8 text-muted font-monospace d-block">{{ user.email }} • {{ user.phone }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    @if (user.type === 'contractor') {
                      <span class="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2 py-1 fs-8 text-uppercase">
                        <i class="bi bi-building"></i> Contractor
                      </span>
                    } @else {
                      <span class="badge bg-info bg-opacity-10 text-info fw-semibold px-2 py-1 fs-8 text-uppercase">
                        <i class="bi bi-person"></i> Consumer
                      </span>
                    }
                  </td>
                  <td>
                    @if (user.type === 'contractor') {
                      <div class="fs-7-5 text-dark fw-medium">
                        {{ user.companyName }}
                        <div class="fs-8 text-muted font-monospace mt-0.5">VAT: {{ user.vatNumber }}</div>
                      </div>
                    } @else {
                      <span class="text-muted fs-8">—</span>
                    }
                  </td>
                  <td>
                    <span class="fs-7-5 text-muted">{{ user.joinedAt | date:'mediumDate' }}</span>
                  </td>
                  <td>
                    <span [class]="'status-badge status-badge--' + user.status">
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    <div class="d-flex justify-content-end gap-1">
                      <button
                        class="btn btn-icon-btn btn-sm"
                        (click)="resetPassword(user)"
                        title="Reset Password Link"
                      >
                        <i class="bi bi-key text-warning"></i>
                      </button>
                      
                      @if (user.status === 'active') {
                        <button
                          class="btn btn-icon-btn btn-sm"
                          (click)="toggleStatus(user)"
                          title="Suspend Account"
                        >
                          <i class="bi bi-slash-circle text-danger"></i>
                        </button>
                      } @else {
                        <button
                          class="btn btn-icon-btn btn-sm"
                          (click)="toggleStatus(user)"
                          title="Reactivate Account"
                        >
                          <i class="bi bi-check-circle text-success"></i>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-people fs-2 d-block mb-3 opacity-30"></i>
                    <p class="mb-0 fw-medium">No user accounts found matching current query</p>
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
    .fs-8 {
      font-size: 0.72rem;
      letter-spacing: 0.02rem;
    }

    .avatar-circle {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
    }

    .avatar-circle--customer {
      background: rgba(23, 162, 184, 0.1);
      color: #17a2b8;
    }

    .avatar-circle--contractor {
      background: rgba(0, 123, 255, 0.1);
      color: #007bff;
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
export class CustomerListComponent {
  private readonly userCatalogService = inject(UserCatalogService);
  private readonly toast = inject(ToastService);

  readonly searchQuery = signal('');
  readonly selectedTab = signal<'all' | 'customer' | 'contractor'>('all');

  readonly allCustomers = this.userCatalogService.customers;

  readonly filteredAccounts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const tab = this.selectedTab();

    return this.allCustomers().filter(user => {
      const matchesSearch = !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.companyName && user.companyName.toLowerCase().includes(query));

      const matchesTab = tab === 'all' || user.type === tab;

      return matchesSearch && matchesTab;
    });
  });

  toggleStatus(user: CustomerAccount): void {
    this.userCatalogService.toggleCustomerStatus(user.id);
    const updatedUser = this.userCatalogService.customers().find(c => c.id === user.id);
    
    if (updatedUser?.status === 'active') {
      this.toast.success(`Account for "${user.name}" has been reactivated.`);
    } else {
      this.toast.warning(`Account for "${user.name}" has been suspended.`);
    }
  }

  resetPassword(user: CustomerAccount): void {
    this.toast.success(`Password reset trigger sent to ${user.email}`);
  }
}
