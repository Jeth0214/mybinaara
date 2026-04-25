import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SearchFiltersComponent, SearchFilter } from './components/search-filters/search-filters.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { SearchEmptyStateComponent } from './components/search-empty-state/search-empty-state.component';
import { HomeCategoriesComponent } from '../home/components/home-categories/home-categories.component';
import { MOCK_SEARCH_PRODUCTS } from '../core/data/mock-search-products.data';
import { MOCK_CATEGORIES } from '../core/data/mock-categories.data';
import { Category } from '../core/models/category.model';

@Component({
  selector: 'app-search',
  templateUrl: 'search.page.html',
  styleUrls: ['search.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    SearchBarComponent,
    SearchFiltersComponent,
    SearchResultsComponent,
    SearchEmptyStateComponent,
    HomeCategoriesComponent,
  ],
})
export class SearchPage implements OnInit {
  private route = inject(ActivatedRoute);

  query = signal<string>('');
  activeFilter = signal<SearchFilter>('all');
  priceAsc = signal<boolean>(true);
  selectedCategory = signal<string | null>(null);

  readonly categories = MOCK_CATEGORIES;

  hasQuery = computed(
    () => this.query().trim().length > 0 || this.selectedCategory() !== null
  );

  filteredResults = computed(() => {
    const q = this.query().toLowerCase().trim();
    const cat = this.selectedCategory();

    if (!q && !cat) return [];

    let results = MOCK_SEARCH_PRODUCTS.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      const matchesCategory = !cat || p.category === cat;
      return matchesQuery && matchesCategory;
    });

    switch (this.activeFilter()) {
      case 'nearby':
        return [...results].sort((a, b) => a.distanceKm - b.distanceKm);
      case 'price':
        return this.priceAsc()
          ? [...results].sort((a, b) => a.price - b.price)
          : [...results].sort((a, b) => b.price - a.price);
      case 'instock':
        return results.filter((p) => p.storeCount > 0);
      default:
        return results;
    }
  });

  ngOnInit() {
    const q = this.route.snapshot.queryParamMap.get('q') ?? '';
    this.query.set(q);
    const cat = this.route.snapshot.queryParamMap.get('cat') ?? '';
    if (cat) this.selectedCategory.set(cat);
  }

  onFilterChange(filter: SearchFilter) {
    if (filter === 'price' && this.activeFilter() === 'price') {
      this.priceAsc.update((v) => !v);
    } else {
      this.activeFilter.set(filter);
      if (filter !== 'price') this.priceAsc.set(true);
    }
  }

  onCategorySelected(category: Category) {
    this.selectedCategory.update((current) =>
      current === category.name ? null : category.name
    );
  }
}
