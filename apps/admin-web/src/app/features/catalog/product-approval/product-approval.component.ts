import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { UserCatalogService } from '../../../core/services/user-catalog.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/catalog.model';

@Component({
  selector: 'app-product-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-4 relative" style="max-width: 1100px;">
      <!-- Header -->
      <div class="mb-4">
        @if (fromStoreId()) {
          <a [routerLink]="['/stores', fromStoreId()]" class="text-decoration-none text-muted fs-7 d-inline-flex align-items-center gap-1 mb-2">
            <i class="bi bi-arrow-left"></i> Back to Store Details
          </a>
        } @else {
          <a routerLink="/catalog/products" class="text-decoration-none text-muted fs-7 d-inline-flex align-items-center gap-1 mb-2">
            <i class="bi bi-arrow-left"></i> Back to Catalog
          </a>
        }
        <h4 class="fw-bold mb-1">Product Approval Queue</h4>
        <p class="text-muted mb-0">Inspect and approve newly uploaded items submitted by vendors before they go live</p>
      </div>

      <div class="row g-4">
        <!-- Left: Pending list (5/12) -->
        <div class="col-lg-5 col-md-12">
          <div class="card border-0 shadow-sm overflow-hidden">
            <div class="card-header bg-white border-bottom-0 py-3">
              <h6 class="mb-0 fw-bold">Pending Approval ({{ pendingProducts().length }})</h6>
            </div>
            
            <div class="list-group list-group-flush border-top">
              @for (prod of pendingProducts(); track prod.id) {
                <button
                  class="list-group-item list-group-item-action text-start p-3 border-0 border-bottom d-flex align-items-start gap-3"
                  [class.active-item]="selectedProductId() === prod.id"
                  (click)="selectProduct(prod.id)"
                >
                  <div class="item-thumb bg-light rounded text-muted d-flex align-items-center justify-content-center flex-shrink-0">
                    <i class="bi bi-box-seam fs-5"></i>
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <div class="d-flex justify-content-between align-items-start gap-2">
                      <h6 class="mb-0 fw-semibold text-truncate fs-7-5" [class.text-success]="selectedProductId() === prod.id">
                        {{ prod.name }}
                      </h6>
                      <strong class="text-success fs-7-5">{{ prod.price | number:'1.2-2' }} SAR</strong>
                    </div>
                    <span class="fs-8 text-muted d-block font-monospace mt-0.5">SKU: {{ prod.sku }}</span>
                    <span class="fs-8 text-secondary fw-semibold mt-1.5 d-block">Store: {{ prod.storeName }}</span>
                  </div>
                </button>
              } @empty {
                <div class="text-center py-5 text-muted">
                  <i class="bi bi-check2-circle text-success display-6 d-block mb-3 opacity-40"></i>
                  <p class="mb-0 fw-semibold">No products pending approval!</p>
                  <small>Vendor submissions are clean.</small>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right: Detail Viewer & Action Panel (7/12) -->
        <div class="col-lg-7 col-md-12">
          @if (selectedProduct(); as prod) {
            <div class="card border-0 shadow-sm p-4 sticky-top animate-fade" style="top: 20px;">
              <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
                <div>
                  <h5 class="fw-bold mb-1">{{ prod.name }}</h5>
                  <span class="fs-8 text-muted font-monospace">SKU: {{ prod.sku }}</span>
                </div>
                <span [class]="'badge text-uppercase fs-8 fw-bold px-2.5 py-1.5 ' + 
                  (prod.status === 'approved' ? 'bg-success text-white' : 
                   prod.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger text-white')">
                  {{ prod.status }} Review
                </span>
              </div>

              <!-- Product Specifications -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <span class="d-block text-muted fs-8 text-uppercase">Vendor Store</span>
                  <strong class="text-dark">{{ prod.storeName }}</strong>
                </div>
                <div class="col-md-3">
                  <span class="d-block text-muted fs-8 text-uppercase">Category</span>
                  <strong class="text-dark">{{ prod.category }}</strong>
                </div>
                <div class="col-md-3">
                  <span class="d-block text-muted fs-8 text-uppercase">Brand</span>
                  <strong class="text-dark">{{ prod.brand }}</strong>
                </div>

                <div class="col-md-12 mt-3">
                  <span class="d-block text-muted fs-8 text-uppercase">Listed Selling Price</span>
                  <strong class="text-success display-6 fw-bold">{{ prod.price | number:'1.2-2' }} SAR</strong>
                </div>
              </div>

              <!-- Description -->
              <div class="mb-4">
                <span class="d-block text-muted fs-8 text-uppercase mb-1.5">Product Description</span>
                <p class="text-secondary fs-7-5 lh-lg bg-light p-3 rounded-3 mb-0 border">
                  {{ prod.description }}
                </p>
              </div>

              <!-- Master Approval Controls -->
              @if (prod.status === 'pending') {
                <div class="d-flex gap-2 border-top pt-4">
                  <button
                    class="btn btn-success w-50 py-2.5 d-flex align-items-center justify-content-center gap-2 fw-semibold fs-7-5"
                    (click)="approveProduct(prod)"
                  >
                    <i class="bi bi-check-circle"></i> Approve & Live List
                  </button>
                  <button
                    class="btn btn-outline-danger w-50 py-2.5 d-flex align-items-center justify-content-center gap-2 fw-semibold fs-7-5"
                    (click)="openRejectModal(prod.id)"
                  >
                    <i class="bi bi-x-circle"></i> Reject Submission
                  </button>
                </div>
              } @else {
                <div class="alert alert-info d-flex align-items-center gap-2 mt-4 fs-7-5 mb-0">
                  <i class="bi bi-info-circle-fill text-primary"></i>
                  <span>This product has already been reviewed and is marked as <strong>{{ prod.status }}</strong>.</span>
                </div>
              }
            </div>
          } @else {
            <div class="card border-0 shadow-sm p-5 text-center text-muted">
              <i class="bi bi-box-seam fs-1 d-block mb-3 opacity-30"></i>
              <h5>Select a product for approval details</h5>
              <p class="mb-0">Choose an item from the left queue to review specification sheets and description logs.</p>
            </div>
          }
        </div>
      </div>

      <!-- REJECTION REASON MODAL OVERLAY -->
      @if (showRejectModal()) {
        <div class="custom-overlay">
          <div class="custom-modal-card p-4 rounded-3 shadow border">
            <h5 class="fw-semibold text-danger mb-2">Reject Product Submission</h5>
            <p class="text-muted fs-7 mb-3">Provide feedback on why this product was rejected. The merchant will receive this directly and can update the listing details.</p>

            <div class="mb-3">
              <label class="form-label fw-semibold fs-8 text-uppercase text-muted">Rejection Notes / Reasons</label>
              <textarea
                class="form-control fs-7-5"
                rows="3"
                placeholder="e.g. Product description is too short, or pricing falls below compliance guidelines."
                [(ngModel)]="rejectionReason"
              ></textarea>
            </div>

            <div class="d-flex justify-content-end gap-2">
              <button class="btn btn-light btn-sm fs-7-5" (click)="closeRejectModal()">Cancel</button>
              <button class="btn btn-danger btn-sm px-3 fs-7-5" (click)="submitRejectProduct()">Confirm Rejection</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .fs-8 {
      font-size: 0.72rem;
      letter-spacing: 0.02rem;
    }

    .item-thumb {
      width: 46px;
      height: 46px;
      border: 1px solid var(--brand-border);
    }

    .list-group-item {
      cursor: pointer;
      transition: background-color 0.15s;

      &:hover {
        background-color: var(--brand-surface) !important;
      }
    }

    .active-item {
      background-color: rgba(45, 122, 79, 0.04) !important;
      border-left: 3px solid var(--brand-green) !important;
    }

    .animate-fade {
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    // Modal
    .custom-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(28, 35, 25, 0.45);
      backdrop-filter: blur(4px);
      z-index: 1060;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeInOverlay 0.2s ease-out;
    }

    .custom-modal-card {
      background: #ffffff;
      max-width: 440px;
      width: 90%;
      border: 1px solid var(--brand-border);
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }

    @keyframes fadeInOverlay {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class ProductApprovalComponent implements OnInit {
  private readonly userCatalogService = inject(UserCatalogService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly pendingProducts = this.userCatalogService.pendingProducts;
  readonly selectedProductId = signal<string | null>(null);
  readonly fromStoreId = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('productId');
    if (id) {
      this.selectedProductId.set(id);
    }
    const storeId = this.route.snapshot.queryParamMap.get('fromStoreId');
    if (storeId) {
      this.fromStoreId.set(storeId);
    }
  }

  readonly selectedProduct = computed(() => {
    const id = this.selectedProductId();
    return id ? this.userCatalogService.products().find(p => p.id === id) : null;
  });

  readonly showRejectModal = signal(false);
  readonly rejectionReason = signal('');

  selectProduct(id: string): void {
    this.selectedProductId.set(id);
  }

  approveProduct(product: Product): void {
    this.userCatalogService.updateProductStatus(product.id, 'approved');
    this.toast.success(`Product "${product.name}" is approved and live!`);
    
    // Auto-select the next pending product if available
    const remaining = this.pendingProducts();
    if (remaining.length > 0) {
      this.selectedProductId.set(remaining[0].id);
    } else {
      this.selectedProductId.set(null);
    }
  }

  openRejectModal(id: string): void {
    this.rejectionReason.set('');
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
  }

  submitRejectProduct(): void {
    const id = this.selectedProductId();
    const reason = this.rejectionReason().trim();

    if (!id) return;
    if (!reason) {
      this.toast.error('Rejection reason is required.');
      return;
    }

    const prod = this.selectedProduct();
    if (prod) {
      this.userCatalogService.updateProductStatus(prod.id, 'rejected', reason);
      this.toast.warning(`Product "${prod.name}" has been rejected.`);
    }

    this.closeRejectModal();

    // Auto-select the next pending product if available
    const remaining = this.pendingProducts();
    if (remaining.length > 0) {
      this.selectedProductId.set(remaining[0].id);
    } else {
      this.selectedProductId.set(null);
    }
  }
}
