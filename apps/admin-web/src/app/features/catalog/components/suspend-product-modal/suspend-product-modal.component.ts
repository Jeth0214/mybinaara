import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-suspend-product-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './suspend-product-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuspendProductModalComponent {
  readonly activeModal = inject(NgbActiveModal);

  @Input() product!: Product;
  readonly reason = signal('');

  confirm(): void {
    const trimmed = this.reason().trim();
    if (!trimmed) return;

    this.activeModal.close(trimmed);
  }
}
