import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, ProductStatus } from '../../../core/models/product.model';
import { AdminAuthState } from '../../../core/state/auth.state';
import { StoreConfirmModalComponent } from '../../stores/components/store-confirm-modal/store-confirm-modal.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NgbDropdownModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private readonly store = inject(Store);
  private sub = new Subscription();

  readonly productId = signal<string | null>(null);
  readonly currentUser = this.store.selectSignal(AdminAuthState.user);
  readonly canEdit = computed(() => !!this.currentUser()?.permissions.includes('products.edit'));
  readonly canHide = computed(() => !!this.currentUser()?.permissions.includes('products.hide'));
  readonly canSuspend = computed(() => !!this.currentUser()?.permissions.includes('products.suspend'));
  readonly canDelete = computed(() => !!this.currentUser()?.permissions.includes('products.delete'));
  readonly canChangeStatus = computed(() => this.canHide() || this.canSuspend());

  readonly product = signal<Product | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly mutating = signal(false);
  readonly busy = computed(() => this.loading() || this.mutating());

  readonly availableStatusActions = computed(() => {
    const product = this.product();
    if (!product) return [] as { label: string; target: ProductStatus }[];

    const actions: { label: string; target: ProductStatus }[] = [];
    if (product.status === 'active') {
      if (this.canHide()) actions.push({ label: 'Set Inactive', target: 'inactive' });
      if (this.canSuspend()) actions.push({ label: 'Suspend', target: 'suspended' });
    } else if (product.status === 'inactive') {
      if (this.canHide() || this.canSuspend()) actions.push({ label: 'Set Active', target: 'active' });
      if (this.canSuspend()) actions.push({ label: 'Suspend', target: 'suspended' });
    } else if (product.status === 'suspended') {
      if (this.canSuspend()) actions.push({ label: 'Unsuspend', target: 'active' });
    }

    return actions;
  });

  ngOnInit(): void {
    this.sub.add(
      this.route.params.subscribe(params => {
        const id = params['id'] || null;
        this.productId.set(id);
        if (id) {
          this.fetchProduct(+id);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  fetchProduct(id: number): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.notFound.set(false);

    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.loading.set(false);
        this.product.set(product);
      },
      error: (err) => {
        this.loading.set(false);
        const message: string = err?.message ?? '';
        if (message.toLowerCase().includes('no query results')) {
          this.notFound.set(true);
        } else {
          this.loadError.set(message || 'Failed to load this product.');
        }
      },
    });
  }

  changeStatus(target: ProductStatus): void {
    const product = this.product();
    if (!product) return;

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set(`${target === 'suspended' ? 'Suspend' : target === 'active' ? 'Activate' : 'Deactivate'} Product`);
    modalRef.componentInstance.message.set(
      `Are you sure you want to set <strong>${product.name}</strong> to <strong>${target}</strong>?`
    );
    modalRef.componentInstance.confirmText.set('Confirm');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(target === 'suspended');

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) return;

        this.mutating.set(true);
        this.productService.updateProductStatus(product.id, target).subscribe({
          next: (updated) => {
            this.mutating.set(false);
            this.product.set(updated);
            this.toast.success(`"${updated.name}" is now ${updated.status}.`);
          },
          error: (err) => {
            this.mutating.set(false);
            this.toast.error(err?.message ?? 'Failed to update status.');
          },
        });
      },
      () => {}
    );
  }

  deleteProduct(): void {
    const product = this.product();
    if (!product) return;

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set('Delete Product');
    modalRef.componentInstance.message.set(
      `Are you sure you want to delete <strong>${product.name}</strong>?<br>This action cannot be undone.`
    );
    modalRef.componentInstance.confirmText.set('Delete Product');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(true);

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) return;

        this.mutating.set(true);
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.mutating.set(false);
            this.toast.success(`"${product.name}" has been deleted successfully.`);
            this.router.navigate(['/catalog/products']);
          },
          error: (err) => {
            this.mutating.set(false);
            this.toast.error(err?.message ?? 'Failed to delete product.');
          },
        });
      },
      () => {}
    );
  }
}
