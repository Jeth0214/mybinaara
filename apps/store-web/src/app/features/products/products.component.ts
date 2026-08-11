import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbModal, NgbModalModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { EMPTY, Subject, merge } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, skip, switchMap } from 'rxjs/operators';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { Product, ProductStatus, PaginationMeta, MAX_PRODUCTS_PER_STORE } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductDetailsModalComponent } from './components/product-details-modal/product-details-modal.component';
import { QuickStockModalComponent } from './components/quick-stock-modal/quick-stock-modal.component';
import { DeleteConfirmModalComponent } from './components/delete-confirm-modal/delete-confirm-modal.component';
import { StatusConfirmModalComponent } from './components/status-confirm-modal/status-confirm-modal.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgbModalModule, NgbDropdownModule, MatPaginatorModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly modalService = inject(NgbModal);
  private readonly toast = inject(ToastService);

  readonly maxProducts = MAX_PRODUCTS_PER_STORE;

  readonly searchQuery = signal('');
  readonly categoryFilter = signal<'all' | number>('all');
  readonly statusFilter = signal<'all' | ProductStatus>('all');

  readonly categories = signal<Category[]>([]);

  readonly products = signal<Product[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly mutating = signal(false);
  readonly busy = computed(() => this.loading() || this.mutating());

  readonly hasActiveFilters = computed(
    () => this.searchQuery().trim() !== '' || this.categoryFilter() !== 'all' || this.statusFilter() !== 'all'
  );

  /** Total product count for the store, independent of any active filters —
   *  used for the product-limit banner. Refreshed on every unfiltered load. */
  readonly storeProductTotal = signal<number | null>(null);
  readonly isLimitReached = computed(() => (this.storeProductTotal() ?? 0) >= this.maxProducts);
  readonly slotsRemaining = computed(() => Math.max(0, this.maxProducts - (this.storeProductTotal() ?? 0)));

  /** Stats reflect only the current page of results, not the whole catalog —
   *  there is no dedicated stats endpoint on the backend. */
  readonly inStockCount = computed(() => this.products().filter((p) => p.stock_quantity > 10).length);
  readonly lowStockCount = computed(() => this.products().filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 10).length);
  readonly outOfStockCount = computed(() => this.products().filter((p) => p.stock_quantity === 0).length);

  private readonly reload$ = new Subject<number>();

  constructor() {
    this.reload$
      .pipe(
        switchMap((page) => {
          this.loading.set(true);
          this.loadError.set(null);

          const categoryFilter = this.categoryFilter();

          return this.productService
            .listProducts({
              search: this.searchQuery().trim(),
              page,
              status: this.statusFilter(),
              category_id: categoryFilter === 'all' ? undefined : categoryFilter,
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
        if (!this.hasActiveFilters()) {
          this.storeProductTotal.set(response.meta.total);
        }
      });

    merge(
      toObservable(this.searchQuery).pipe(skip(1), debounceTime(300), distinctUntilChanged()),
      toObservable(this.categoryFilter).pipe(skip(1), distinctUntilChanged()),
      toObservable(this.statusFilter).pipe(skip(1), distinctUntilChanged())
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadProducts(1));

    this.loadProducts(1);
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.listCategories({ is_active: true }).subscribe({
      next: (response) => this.categories.set(response.data),
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

  resetFilters(): void {
    this.searchQuery.set('');
    this.categoryFilter.set('all');
    this.statusFilter.set('all');
  }

  /** Store users may only toggle between active/inactive, and never on a
   *  suspended product (the backend has no valid transition for them there). */
  onStatusToggle(product: Product, event: Event): void {
    event.preventDefault();
    if (product.status === 'suspended') return;

    const modalRef = this.modalService.open(StatusConfirmModalComponent, { centered: true });
    modalRef.componentInstance.product = product;
    modalRef.result.then(
      (updated) => {
        if (updated) this.loadProducts(this.meta()?.current_page ?? 1);
      },
      () => {}
    );
  }

  openViewDetailsModal(product: Product): void {
    const modalRef = this.modalService.open(ProductDetailsModalComponent, { centered: true, size: 'md' });
    modalRef.componentInstance.product = product;
  }

  openQuickStockModal(product: Product): void {
    const modalRef = this.modalService.open(QuickStockModalComponent, { centered: true });
    modalRef.componentInstance.product = product;
    modalRef.result.then(
      (updated) => {
        if (updated) this.loadProducts(this.meta()?.current_page ?? 1);
      },
      () => {}
    );
  }

  openDeleteConfirmModal(product: Product): void {
    const modalRef = this.modalService.open(DeleteConfirmModalComponent, { centered: true });
    modalRef.componentInstance.product = product;
    modalRef.result.then(
      (deleted) => {
        if (deleted) this.loadProducts(this.meta()?.current_page ?? 1);
      },
      () => {}
    );
  }
}
