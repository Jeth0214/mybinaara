import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, PRODUCT_CATEGORIES } from '../../../core/models/product.model';

@Component({
  selector: 'app-update-stock',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './update-stock.component.html',
  styleUrl: './update-stock.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateStockComponent {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  readonly products = this.productService.products;
  readonly categories = PRODUCT_CATEGORIES;

  // Unsaved changes local signal: maps productId -> newStockLevel
  readonly pendingModifications = signal<Record<string, number>>({});

  // Computed signals
  readonly hasChanges = computed(() => Object.keys(this.pendingModifications()).length > 0);
  readonly modifiedCount = computed(() => Object.keys(this.pendingModifications()).length);

  isModified(productId: string): boolean {
    return this.pendingModifications()[productId] !== undefined;
  }

  getCurrentStockValue(product: Product): number {
    const pending = this.pendingModifications()[product.id];
    return pending !== undefined ? pending : product.stock;
  }

  getCategoryIcon(categoryName: string): string {
    const cat = this.categories.find((c) => c.name === categoryName);
    return cat ? cat.iconPath : 'images/category-icons/miscellaneous.svg';
  }

  adjustStock(productId: string, amount: number): void {
    const product = this.products().find((p) => p.id === productId);
    if (!product) return;

    const current = this.getCurrentStockValue(product);
    const newValue = Math.max(0, current + amount);

    this.updatePendingValue(productId, newValue, product.stock);
  }

  onStockInputChange(productId: string, event: Event): void {
    const product = this.products().find((p) => p.id === productId);
    if (!product) return;

    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val)) {
      this.updatePendingValue(productId, Math.max(0, val), product.stock);
    }
  }

  private updatePendingValue(productId: string, newValue: number, originalStock: number): void {
    this.pendingModifications.update((current) => {
      const updated = { ...current };
      if (newValue === originalStock) {
        delete updated[productId]; // Reverted back to original
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
    const updates = Object.keys(mods).map((id) => ({
      id,
      stock: mods[id],
    }));

    if (updates.length === 0) return;

    this.productService.updateStocks(updates).subscribe({
      next: () => {
        this.toastService.success(`Successfully updated stock levels for ${updates.length} products.`);
        this.pendingModifications.set({}); // Reset modifications map
      },
      error: (err) => {
        this.toastService.error(err?.message || 'Failed to update stock levels.');
      },
    });
  }
}
