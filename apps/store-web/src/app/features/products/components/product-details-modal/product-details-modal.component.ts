import { ChangeDetectionStrategy, Component, Input, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Product } from '../../../../core/models/product.model';
import { ProductStatusBadgeComponent } from '../product-status-badge/product-status-badge.component';

@Component({
  selector: 'app-product-details-modal',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductStatusBadgeComponent],
  templateUrl: './product-details-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ProductDetailsModalComponent {
  readonly activeModal = inject(NgbActiveModal);
  @Input() product!: Product;
}
