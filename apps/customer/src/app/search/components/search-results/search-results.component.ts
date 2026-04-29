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
    'Cement': 'cube-outline',
    'Glass':  'apps-outline',
    'Steel':  'cut-outline',
    'Wood':   'leaf-outline',
    'Paint':  'color-palette-outline',
    'Tiles':  'grid-outline',
  };

  getCategoryIcon(category: string): string {
    return this.CATEGORY_ICONS[category] ?? 'cube-outline';
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }
}
