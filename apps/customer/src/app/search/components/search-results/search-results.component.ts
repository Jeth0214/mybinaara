import { Component, input, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { SearchProduct } from '../../../core/models/search-product.model';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class SearchResultsComponent {
  private router = inject(Router);

  products = input<SearchProduct[]>([]);
  query = input<string>('');
  selectedCategory = input<string | null>(null);

  navigateToProduct(product: SearchProduct) {
    this.router.navigate(['/product', product.id]);
  }

  private readonly CATEGORY_ICONS: Record<string, string> = {
    'Building Materials': '/assets/categories/building-materials.svg',
    'Cement & Blocks': '/assets/categories/cement-and-blocks.svg',
    'Steel & Metal': '/assets/categories/steel-and-metal.svg',
    'Doors & Windows': '/assets/categories/doors-and-windows.svg',
    'Paint & Finishes': '/assets/categories/paints-and-finishes.svg',
    'Electrical': '/assets/categories/electrical.svg',
    'Plumbing': '/assets/categories/plumbing.svg',
    'HVAC & Air Conditioning': '/assets/categories/hvac-and-air-conditioning.svg',
    'Wood & Carpentry': '/assets/categories/wood-and-carpentry.svg',
    'Roofing': '/assets/categories/roofing.svg',
    'Flooring & Tiles': '/assets/categories/flooring-and-tiles.svg',
    'Glass & Aluminum': '/assets/categories/glass-and-aluminum.svg',
    'Waterproofing': '/assets/categories/waterproofing.svg',
    'Tools & Hardware': '/assets/categories/tools-and-hardware.svg',
    'Equipment & Machinery': '/assets/categories/equipments-and-machinery.svg',
    'Safety Supplies': '/assets/categories/safety-supplies.svg',
    'Landscaping': '/assets/categories/landscaping.svg',
    'Miscellaneous': '/assets/categories/miscellaneous.svg',
  };

  getCategoryIcon(category: string): string {
    return this.CATEGORY_ICONS[category] ?? '/assets/categories/miscellaneous.svg';
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }
}
