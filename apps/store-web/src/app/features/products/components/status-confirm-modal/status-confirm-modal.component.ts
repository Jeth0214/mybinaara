import { ChangeDetectionStrategy, Component, Input, inject, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from '../../../../core/services/product.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-status-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-confirm-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class StatusConfirmModalComponent {
  readonly activeModal = inject(NgbActiveModal);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  @Input() product!: Product;
  readonly updating = signal<boolean>(false);

  confirmStatusChange(): void {
    if (!this.product || this.updating()) return;

    const targetStatus = this.product.status === 'active' ? 'inactive' : 'active';

    this.updating.set(true);
    this.productService.updateProductStatus(this.product.id, targetStatus).subscribe({
      next: (updated) => {
        this.toastService.success(`"${updated.catalog_product.name}" is now ${updated.status}.`);
        this.updating.set(false);
        this.activeModal.close(true);
      },
      error: (err) => {
        this.toastService.error(err?.message || 'Failed to update product status.');
        this.updating.set(false);
      },
    });
  }
}
