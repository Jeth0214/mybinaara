import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SearchFiltersComponent, SearchFilter } from './components/search-filters/search-filters.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { SearchEmptyStateComponent } from './components/search-empty-state/search-empty-state.component';
import { HomeCategoriesComponent } from '../home/components/home-categories/home-categories.component';
import { CategoryService } from '../shared/services/category.service';
import { ProductService } from '../shared/services/product.service';
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
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);

  query = signal<string>('');
  activeFilter = signal<SearchFilter>('all');
  priceAsc = signal<boolean>(true);
  selectedCategory = signal<string | null>(null);

  categories = this.categoryService.categories;
  results = this.productService.products;
  resultsLoading = this.productService.loading;
  resultsError = this.productService.error;

  hasQuery = computed(
    () => this.query().trim().length > 0 || this.selectedCategory() !== null
  );

  private selectedCategoryId = computed<number | undefined>(() => {
    const name = this.selectedCategory();
    if (!name) return undefined;
    return this.categories().find((c) => c.name === name)?.id;
  });

  filteredResults = computed(() => {
    const results = this.results();

    switch (this.activeFilter()) {
      case 'price':
        return [...results].sort((a, b) => {
          const diff = (a.min_price ?? 0) - (b.min_price ?? 0);
          return this.priceAsc() ? diff : -diff;
        });
      case 'instock':
        return results.filter((p) => p.listings_count > 0);
      case 'nearby':
        // A catalog product spans multiple stores, so there's no single
        // per-product distance to sort by yet — falls back to default order
        // until the search endpoint can annotate results with nearest-listing distance.
        return results;
      default:
        return results;
    }
  });

  constructor() {
    merge(
      toObservable(this.query).pipe(debounceTime(350), distinctUntilChanged()),
      toObservable(this.selectedCategoryId).pipe(distinctUntilChanged())
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.runSearch());
  }

  ngOnInit() {
    const q = this.route.snapshot.queryParamMap.get('q') ?? '';
    this.query.set(q);
    const cat = this.route.snapshot.queryParamMap.get('cat') ?? '';
    if (cat) this.selectedCategory.set(cat);

    this.categoryService.ensureLoaded();
  }

  onFilterChange(filter: SearchFilter) {
    if (filter === 'price' && this.activeFilter() === 'price') {
      this.priceAsc.update((v) => !v);
    } else {
      this.activeFilter.set(filter);
      if (filter !== 'price') this.priceAsc.set(true);
    }
  }

  onSearchReset() {
    this.query.set('');
    this.selectedCategory.set(null);
  }

  onCategorySelected(category: Category) {
    this.selectedCategory.update((current) =>
      current === category.name ? null : category.name
    );
  }

  private runSearch(): void {
    if (!this.hasQuery()) return;
    this.productService.search({
      search: this.query().trim() || undefined,
      category_id: this.selectedCategoryId(),
    });
  }
}
