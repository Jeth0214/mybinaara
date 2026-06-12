import { ChangeDetectionStrategy, Component, Input, inject, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from '../../../../core/services/product.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-delete-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirm-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DeleteConfirmModalComponent {
  readonly activeModal = inject(NgbActiveModal);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  @Input() product!: Product;
  readonly updating = signal<boolean>(false);

  confirmDeleteProduct(): void {
    if (!this.product || this.updating()) return;

    this.updating.set(true);
    this.productService.deleteProduct(this.product.id).subscribe({
      next: () => {
        this.toastService.success('Product has been deleted from your store listings.');
        this.updating.set(false);
        this.activeModal.close(true);
      },
      error: (err) => {
        this.toastService.error(err?.message || 'Failed to delete product.');
        this.updating.set(false);
      },
    });
  }
}
