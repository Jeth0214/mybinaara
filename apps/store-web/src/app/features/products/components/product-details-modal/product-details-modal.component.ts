import { ChangeDetectionStrategy, Component, Input, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-details-modal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ProductDetailsModalComponent {
  readonly activeModal = inject(NgbActiveModal);
  @Input() product!: Product;

  getCategoryIcon(categoryName: string): string {
    switch (categoryName) {
      case 'Building Materials': return 'images/category-icons/building-materials.svg';
      case 'Cement & Blocks': return 'images/category-icons/cement-and-blocks.svg';
      case 'Steel & Metal': return 'images/category-icons/steel-and-metal.svg';
      case 'Doors & Windows': return 'images/category-icons/doors-and-windows.svg';
      case 'Paint & Finishes': return 'images/category-icons/paints-and-finishes.svg';
      case 'Electrical': return 'images/category-icons/electrical.svg';
      case 'Plumbing': return 'images/category-icons/plumbing.svg';
      case 'HVAC & Air Conditioning': return 'images/category-icons/hvac-and-air-conditioning.svg';
      case 'Wood & Carpentry': return 'images/category-icons/wood-and-carpentry.svg';
      case 'Roofing': return 'images/category-icons/roofing.svg';
      case 'Flooring & Tiles': return 'images/category-icons/flooring-and-tiles.svg';
      case 'Glass & Aluminum': return 'images/category-icons/glass-and-aluminum.svg';
      case 'Waterproofing': return 'images/category-icons/waterproofing.svg';
      case 'Tools & Hardware': return 'images/category-icons/tools-and-hardware.svg';
      case 'Equipment & Machinery': return 'images/category-icons/equipments-and-machinery.svg';
      case 'Safety Supplies': return 'images/category-icons/safety-supplies.svg';
      case 'Landscaping': return 'images/category-icons/landscaping.svg';
      default: return 'images/category-icons/miscellaneous.svg';
    }
  }

  getCategoryClass(categoryName: string): string {
    switch (categoryName) {
      case 'Cement & Blocks':
        return 'cat-cement';
      case 'Steel & Metal':
        return 'cat-steel';
      case 'Electrical':
        return 'cat-electrical';
      case 'Plumbing':
        return 'cat-plumbing';
      default:
        return '';
    }
  }
}
