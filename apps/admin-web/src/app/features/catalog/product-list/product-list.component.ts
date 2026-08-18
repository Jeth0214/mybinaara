import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Store } from '@ngxs/store';
import { EMPTY, Subject, merge } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, skip, switchMap } from 'rxjs/operators';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, ProductStatus, PaginationMeta } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { AdminAuthState } from '../../../core/state/auth.state';
import { StoreConfirmModalComponent } from '../../stores/components/store-confirm-modal/store-confirm-modal.component';
import { SuspendProductModalComponent } from '../components/suspend-product-modal/suspend-product-modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgbDropdownModule, MatPaginatorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private readonly store = inject(Store);

  readonly currentUser = this.store.selectSignal(AdminAuthState.user);
  readonly canCreate = computed(() => !!this.currentUser()?.permissions.includes('products.create'));
  readonly canEdit = computed(() => !!this.currentUser()?.permissions.includes('products.edit'));
  readonly canHide = computed(() => !!this.currentUser()?.permissions.includes('products.hide'));
  readonly canSuspend = computed(() => !!this.currentUser()?.permissions.includes('products.suspend'));
  readonly canDelete = computed(() => !!this.currentUser()?.permissions.includes('products.delete'));
  readonly canChangeStatus = computed(() => this.canHide() || this.canSuspend());

  readonly searchQuery = signal('');
  readonly statusFilter = signal<'all' | ProductStatus>('all');
  readonly categoryFilter = signal<'all' | number>('all');
  readonly storeNameFilter = signal('');

  readonly categories = signal<Category[]>([]);

  readonly products = signal<Product[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly mutating = signal(false);
  readonly busy = computed(() => this.loading() || this.mutating());

  readonly hasActiveFilters = computed(
    () =>
      this.searchQuery().trim() !== '' ||
      this.statusFilter() !== 'all' ||
      this.categoryFilter() !== 'all' ||
      this.storeNameFilter().trim() !== ''
  );

  /** True once we know the catalog has no products at all (not just no matches for the current filters). */
  readonly isCatalogEmpty = computed(
    () => !this.loading() && !this.hasActiveFilters() && (this.meta()?.total ?? 0) === 0
  );

  readonly filtersDisabled = computed(() => this.mutating() || this.isCatalogEmpty());

  /** Every fetch (search, pagination, retry, post-mutation refresh) goes through
   *  this single switchMap pipeline, so a newer request always cancels an
   *  older one still in flight — not just for search. */
  private readonly reload$ = new Subject<number>();

  constructor() {
    this.reload$
      .pipe(
        switchMap((page) => {
          this.loading.set(true);
          this.loadError.set(null);

          const categoryFilter = this.categoryFilter();
          const storeName = this.storeNameFilter().trim();

          return this.productService
            .listProducts({
              search: this.searchQuery().trim(),
              page,
              status: this.statusFilter(),
              category_id: categoryFilter === 'all' ? undefined : categoryFilter,
              store_name: storeName === '' ? undefined : storeName,
            })
            .pipe(
              catchError((err) => {
                this.loading.set(false);
                this.loadError.set(err?.message ?? 'Failed to load products.');
                return EMPTY;
              })
            );
        }),
        takeUntilDestroyed()
      )
      .subscribe((response) => {
        this.loading.set(false);
        this.products.set(response.data);
        this.meta.set(response.meta);
      });

    merge(
      toObservable(this.searchQuery).pipe(skip(1), debounceTime(300), distinctUntilChanged()),
      toObservable(this.statusFilter).pipe(skip(1), distinctUntilChanged()),
      toObservable(this.categoryFilter).pipe(skip(1), distinctUntilChanged()),
      toObservable(this.storeNameFilter).pipe(skip(1), debounceTime(300), distinctUntilChanged())
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadProducts(1));

    this.loadProducts(1);
    this.loadFilterOptions();
  }

  private loadFilterOptions(): void {
    this.categoryService.listCategories({ is_active: true }).subscribe({
      next: (categories) => {
        this.categories.set(categories.data);
      },
      error: () => {
        // Filter dropdown options are non-critical; leave them empty on failure.
      },
    });
  }

  loadProducts(page: number): void {
    this.reload$.next(page);
  }

  handlePageEvent(event: PageEvent): void {
    this.loadProducts(event.pageIndex + 1);
  }

  /** Mirrors the backend's UpdateProductStatusRequest transition rules, so
   *  only actions the API will actually accept are ever offered. */
  availableStatusActions(product: Product): { label: string; target: ProductStatus }[] {
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
  }

  changeStatus(product: Product, target: ProductStatus): void {
    if (target === 'suspended') {
      const modalRef = this.modalService.open(SuspendProductModalComponent, { centered: true });
      modalRef.componentInstance.product = product;

      modalRef.result.then(
        (reason: string | false) => {
          if (!reason) return;
          this.applyStatusChange(product, target, reason);
        },
        () => {}
      );
      return;
    }

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set(`${target === 'active' ? 'Activate' : 'Deactivate'} Product`);
    modalRef.componentInstance.message.set(
      `Are you sure you want to set <strong>${product.name}</strong> to <strong>${target}</strong>?`
    );
    modalRef.componentInstance.confirmText.set('Confirm');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(false);

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) return;
        this.applyStatusChange(product, target);
      },
      () => {}
    );
  }

  private applyStatusChange(product: Product, target: ProductStatus, reason?: string): void {
    this.mutating.set(true);
    this.productService.updateProductStatus(product.id, target, reason).subscribe({
      next: (updated) => {
        this.mutating.set(false);
        this.products.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
        this.toast.success(`"${product.name}" is now ${updated.status}.`);
      },
      error: (err) => {
        this.mutating.set(false);
        this.toast.error(err?.message ?? 'Failed to update status.');
      },
    });
  }

  deleteProduct(product: Product): void {
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
            this.loadProducts(this.meta()?.current_page ?? 1);
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
