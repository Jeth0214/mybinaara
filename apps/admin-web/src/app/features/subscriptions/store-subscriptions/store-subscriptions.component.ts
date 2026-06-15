import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionSupportService } from '../../../core/services/subscription-support.service';
import { ToastService } from '../../../core/services/toast.service';
import { StoreSubscription } from '../../../core/models/subscription-support.model';

@Component({
  selector: 'app-store-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-4" style="max-width: 1200px;">
      <!-- Header -->
      <div class="mb-4">
        <h4 class="fw-bold mb-1">Store Subscription Registry</h4>
        <p class="text-muted mb-0">Monitor billing accounts, active merchant licenses, and manual renewal triggers</p>
      </div>

      <!-- Filters Card -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-3 d-flex flex-column flex-md-row justify-content-between gap-3 align-items-stretch align-items-md-center">
          <!-- Status select -->
          <div class="d-flex align-items-center gap-2" style="max-width: 280px; width: 100%;">
            <label class="fs-8 text-muted fw-bold text-uppercase mb-0 text-nowrap">Filter Status:</label>
            <select
              class="form-select form-select-sm fw-semibold"
              [ngModel]="statusFilter()"
              (ngModelChange)="statusFilter.set($event)"
            >
              <option value="all">All Subscription States</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <!-- Total Metrics Summary -->
          <div class="d-flex gap-3 text-end fs-7-5">
            <div>
              <span class="text-muted">Total Monthly Recurring:</span>
              <strong class="text-success ms-1.5">{{ totalMRR() | number:'1.0-0' }} SAR</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card border-0 shadow-sm overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="table-light text-uppercase fs-8-5 fw-semibold text-muted">
              <tr>
                <th scope="col" class="ps-4">Store Vendor</th>
                <th scope="col">Assigned Plan</th>
                <th scope="col">Rate (SAR/mo)</th>
                <th scope="col">Activation Date</th>
                <th scope="col">Next Renewal Date</th>
                <th scope="col">Billing Status</th>
                <th scope="col" class="text-end pe-4">Manual Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (sub of filteredSubs(); track sub.id) {
                <tr>
                  <td class="ps-4 py-3 fw-semibold text-dark fs-7-5">
                    {{ sub.storeName }}
                  </td>
                  <td>
                    <span [class]="'badge text-uppercase fs-8 px-2 py-1 plan-badge plan-badge--' + sub.planId">
                      {{ sub.planId }}
                    </span>
                  </td>
                  <td>
                    @if (sub.priceSAR === 0) {
                      <span class="text-secondary fw-semibold fs-7-5">Free</span>
                    } @else {
                      <strong class="text-success fs-7-5">{{ sub.priceSAR | number:'1.2-2' }} SAR</strong>
                    }
                  </td>
                  <td>
                    <span class="text-muted fs-7-5">{{ sub.startDate | date:'mediumDate' }}</span>
                  </td>
                  <td>
                    <span class="text-muted fs-7-5" [class.text-danger]="isOverdue(sub.nextRenewalDate)">
                      {{ sub.nextRenewalDate | date:'mediumDate' }}
                    </span>
                  </td>
                  <td>
                    <span
                      class="status-badge"
                      [class.status-badge--active]="sub.status === 'active'"
                      [class.status-badge--suspended]="sub.status === 'expired' || sub.status === 'cancelled'"
                    >
                      {{ sub.status }}
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    @if (sub.status === 'active') {
                      <button
                        class="btn btn-outline-danger btn-sm fs-8 fw-bold"
                        (click)="cancelSub(sub)"
                      >
                        Cancel Billing
                      </button>
                    } @else {
                      <button
                        class="btn btn-success btn-sm fs-8 fw-bold"
                        (click)="renewSub(sub)"
                      >
                        Renew / Reactivate
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-receipt fs-2 d-block mb-3 opacity-30"></i>
                    <p class="mb-0 fw-medium">No subscription registry logs found</p>
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
    }

    .plan-badge {
      font-weight: 700;
      border-radius: 4px;
      
      &.plan-badge--basic {
        background-color: #f7f8f5;
        color: #6c757d;
      }
      &.plan-badge--premium {
        background-color: rgba(45, 122, 79, 0.1);
        color: var(--brand-green);
      }
      &.plan-badge--enterprise {
        background-color: rgba(0, 123, 255, 0.1);
        color: #007bff;
      }
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
export class StoreSubscriptionsComponent {
  private readonly subSupportService = inject(SubscriptionSupportService);
  private readonly toast = inject(ToastService);

  readonly statusFilter = signal('all');

  readonly allSubs = this.subSupportService.storeSubscriptions;

  readonly filteredSubs = computed(() => {
    const status = this.statusFilter();
    return this.allSubs().filter(sub => status === 'all' || sub.status === status);
  });

  // Calculate MRR sum directly from active plans
  readonly totalMRR = computed(() => {
    return this.allSubs()
      .filter(sub => sub.status === 'active')
      .reduce((acc, curr) => acc + curr.priceSAR, 0);
  });

  isOverdue(dateStr: string): boolean {
    return new Date(dateStr).getTime() < Date.now();
  }

  cancelSub(sub: StoreSubscription): void {
    if (confirm(`Are you sure you want to cancel the subscription for "${sub.storeName}"?`)) {
      this.subSupportService.cancelSubscription(sub.id);
      this.toast.warning(`Subscription cancelled for ${sub.storeName}.`);
    }
  }

  renewSub(sub: StoreSubscription): void {
    this.subSupportService.renewSubscription(sub.id);
    this.toast.success(`Subscription renewed and billed for ${sub.storeName}.`);
  }
}
