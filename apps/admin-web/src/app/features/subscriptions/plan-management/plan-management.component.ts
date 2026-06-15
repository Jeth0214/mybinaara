import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionSupportService } from '../../../core/services/subscription-support.service';
import { ToastService } from '../../../core/services/toast.service';
import { SubscriptionPlan } from '../../../core/models/subscription-support.model';

@Component({
  selector: 'app-plan-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-4" style="max-width: 1000px;">
      <!-- Header -->
      <div class="mb-4">
        <h4 class="fw-bold mb-1">Subscription Plan Configurations</h4>
        <p class="text-muted mb-0">Modify billing rates, product upload constraints, and tier-specific features for vendors</p>
      </div>

      <!-- Plans Cards Grid -->
      <div class="row g-4">
        @for (plan of plans(); track plan.id) {
          <div class="col-lg-4 col-md-6 col-12">
            <div
              class="card h-100 border-0 shadow-sm p-4 relative plan-card"
              [class.plan-card--enterprise]="plan.id === 'enterprise'"
              [class.plan-card--premium]="plan.id === 'premium'"
            >
              <!-- Ribbon -->
              @if (plan.id === 'enterprise') {
                <div class="ribbon bg-primary text-white">VIP</div>
              } @else if (plan.id === 'premium') {
                <div class="ribbon bg-success text-white">Popular</div>
              }

              <div class="d-flex flex-column h-100">
                <!-- Title & Price View -->
                <div class="mb-3">
                  <span class="fs-8 text-muted fw-bold text-uppercase d-block">Tier Level</span>
                  <h5 class="fw-bold text-dark mb-2">{{ plan.name }}</h5>
                  
                  <div class="d-flex align-items-baseline gap-1 mt-3">
                    @if (plan.id === 'basic') {
                      <strong class="fs-3 fw-bold text-secondary">Free</strong>
                    } @else {
                      <strong class="fs-3 fw-bold text-success">{{ plan.priceSAR }}</strong>
                      <span class="fs-8 text-muted">SAR / Month</span>
                    }
                  </div>
                </div>

                <!-- Parameters Editor Panel -->
                <div class="border-top pt-3 mt-2 flex-grow-1">
                  <h6 class="fs-8 fw-bold text-uppercase text-secondary mb-3">Service parameters</h6>

                  <!-- Price Edit (only for premium/enterprise) -->
                  @if (plan.id !== 'basic') {
                    <div class="mb-3">
                      <label class="form-label fs-8 fw-semibold text-muted text-uppercase">Price (SAR)</label>
                      <input
                        type="number"
                        class="form-control form-control-sm"
                        min="0"
                        [(ngModel)]="plan.priceSAR"
                      />
                    </div>
                  }

                  <!-- Product Limit -->
                  <div class="mb-3">
                    <label class="form-label fs-8 fw-semibold text-muted text-uppercase">Catalog Upload Limit</label>
                    @if (plan.id === 'enterprise') {
                      <input
                        type="text"
                        readonly
                        class="form-control form-control-sm bg-light font-monospace text-center fw-bold"
                        value="Unlimited"
                      />
                    } @else {
                      <input
                        type="number"
                        class="form-control form-control-sm font-monospace"
                        min="1"
                        [(ngModel)]="plan.productLimit"
                      />
                    }
                  </div>

                  <!-- Toggles -->
                  <div class="form-check form-switch mb-2 fs-7-5 mt-4">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      [id]="plan.id + '-search'"
                      [(ngModel)]="plan.prioritySearch"
                    />
                    <label class="form-check-label text-dark fw-medium" [for]="plan.id + '-search'">Priority Search Rank</label>
                  </div>

                  <div class="form-check form-switch mb-2 fs-7-5">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      [id]="plan.id + '-support'"
                      [(ngModel)]="plan.dedicatedSupport"
                    />
                    <label class="form-check-label text-dark fw-medium" [for]="plan.id + '-support'">Dedicated VIP Support</label>
                  </div>
                </div>

                <!-- Action Save -->
                <div class="mt-4 pt-3 border-top">
                  <button
                    class="btn w-100 fs-7-5 fw-semibold"
                    [class]="plan.id === 'enterprise' ? 'btn-primary' : 'btn-success'"
                    (click)="savePlan(plan)"
                  >
                    Save Tier Settings
                  </button>
                </div>
              </div>

            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .fs-8 {
      font-size: 0.72rem;
    }

    .plan-card {
      border: 1px solid var(--brand-border);
      border-radius: 12px;
      overflow: hidden;
      
      &.plan-card--premium {
        border-color: rgba(45, 122, 79, 0.25);
        box-shadow: 0 4px 16px rgba(45, 122, 79, 0.04) !important;
      }
      &.plan-card--enterprise {
        border-color: rgba(0, 123, 255, 0.25);
        box-shadow: 0 4px 16px rgba(0, 123, 255, 0.04) !important;
      }
    }

    // Ribbons
    .ribbon {
      position: absolute;
      top: 15px;
      right: -30px;
      transform: rotate(45deg);
      width: 110px;
      text-align: center;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.05rem;
      padding: 3px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class PlanManagementComponent {
  private readonly subSupportService = inject(SubscriptionSupportService);
  private readonly toast = inject(ToastService);

  readonly plans = this.subSupportService.plans;

  savePlan(plan: SubscriptionPlan): void {
    if (plan.priceSAR < 0 || plan.productLimit < 0) {
      this.toast.error('Values cannot be negative.');
      return;
    }
    
    this.subSupportService.updatePlan(plan);
    this.toast.success(`Plan settings saved for "${plan.name}".`);
  }
}
