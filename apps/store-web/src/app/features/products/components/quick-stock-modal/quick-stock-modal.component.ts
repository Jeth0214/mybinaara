import { ChangeDetectionStrategy, Component, Input, OnInit, inject, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from '../../../../core/services/product.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-quick-stock-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-stock-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class QuickStockModalComponent implements OnInit {
  readonly activeModal = inject(NgbActiveModal);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  @Input() product!: Product;
  readonly activeStockValue = signal<number>(0);
  readonly updating = signal<boolean>(false);

  ngOnInit(): void {
    if (this.product) {
      this.activeStockValue.set(this.product.stock_quantity);
    }
  }

  onStockInputChange(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val)) {
      this.activeStockValue.set(Math.max(0, val));
    }
  }

  saveQuickStock(): void {
    if (!this.product || this.updating()) return;

    this.updating.set(true);
    this.productService.updateProductStock(this.product.id, this.activeStockValue()).subscribe({
      next: () => {
        this.toastService.success('Stock level updated successfully.');
        this.updating.set(false);
        this.activeModal.close(true);
      },
      error: (err) => {
        this.toastService.error(err?.message || 'Failed to update stock.');
        this.updating.set(false);
      },
    });
  }
}
