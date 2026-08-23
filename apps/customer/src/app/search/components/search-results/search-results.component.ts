import { Component, input, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CatalogProduct } from '../../../core/models/catalog-product.model';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class SearchResultsComponent {
  private router = inject(Router);

  products = input<CatalogProduct[]>([]);
  query = input<string>('');
  selectedCategory = input<string | null>(null);

  navigateToProduct(product: CatalogProduct) {
    this.router.navigate(['/product', product.id]);
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }
}
