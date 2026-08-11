import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, PaginationMeta } from '../../../core/models/product.model';

@Component({
  selector: 'app-update-stock',
  standalone: true,
  imports: [CommonModule, RouterLink, MatPaginatorModule],
  templateUrl: './update-stock.component.html',
  styleUrl: './update-stock.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateStockComponent {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  readonly products = signal<Product[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);

  // Unsaved changes local signal: maps productId -> newStockLevel. Persists
  // across pagination so edits on an earlier page aren't lost while browsing.
  readonly pendingModifications = signal<Record<number, number>>({});

  readonly hasChanges = computed(() => Object.keys(this.pendingModifications()).length > 0);
  readonly modifiedCount = computed(() => Object.keys(this.pendingModifications()).length);

  constructor() {
    this.loadProducts(1);
  }

  loadProducts(page: number): void {
    this.loading.set(true);
    this.productService.listProducts({ page }).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.products.set(response.data);
        this.meta.set(response.meta);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err?.message || 'Failed to load products.');
      },
    });
  }

  handlePageEvent(event: PageEvent): void {
    this.loadProducts(event.pageIndex + 1);
  }

  isModified(productId: number): boolean {
    return this.pendingModifications()[productId] !== undefined;
  }

  getCurrentStockValue(product: Product): number {
    const pending = this.pendingModifications()[product.id];
    return pending !== undefined ? pending : product.stock_quantity;
  }

  adjustStock(productId: number, amount: number): void {
    const product = this.products().find((p) => p.id === productId);
    if (!product) return;

    const current = this.getCurrentStockValue(product);
    const newValue = Math.max(0, current + amount);

    this.updatePendingValue(productId, newValue, product.stock_quantity);
  }

  onStockInputChange(productId: number, event: Event): void {
    const product = this.products().find((p) => p.id === productId);
    if (!product) return;

    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val)) {
      this.updatePendingValue(productId, Math.max(0, val), product.stock_quantity);
    }
  }

  private updatePendingValue(productId: number, newValue: number, originalStock: number): void {
    this.pendingModifications.update((current) => {
      const updated = { ...current };
      if (newValue === originalStock) {
        delete updated[productId];
      } else {
        updated[productId] = newValue;
      }
      return updated;
    });
  }

  discardChanges(): void {
    this.pendingModifications.set({});
    this.toastService.info('Stock adjustments discarded.');
  }

  saveAllChanges(): void {
    const mods = this.pendingModifications();
    const ids = Object.keys(mods).map(Number);

    if (ids.length === 0) return;

    this.saving.set(true);
    forkJoin(ids.map((id) => this.productService.updateProductStock(id, mods[id]))).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success(`Successfully updated stock levels for ${ids.length} products.`);
        this.pendingModifications.set({});
        this.loadProducts(this.meta()?.current_page ?? 1);
      },
      error: (err) => {
        this.saving.set(false);
        this.toastService.error(err?.message || 'Failed to update stock levels.');
      },
    });
  }
}
