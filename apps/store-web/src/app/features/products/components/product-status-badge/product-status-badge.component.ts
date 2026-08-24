import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductStatus } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-status-badge.component.html',
  styleUrl: './product-status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductStatusBadgeComponent {
  @Input() status!: ProductStatus;
}
