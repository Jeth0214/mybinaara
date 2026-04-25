import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IONIC_PAGE_IMPORTS } from '../shared/imports/ionic-page-imports';
import { HomeGreetingComponent } from './components/home-greeting/home-greeting.component';
import { HomeSearchComponent } from './components/home-search/home-search.component';
import { HomeRecentSearchComponent } from './components/home-recent-search/home-recent-search.component';
import { HomeCategoriesComponent } from './components/home-categories/home-categories.component';
import { HomeStoresNearbyComponent } from './components/home-stores-nearby/home-stores-nearby.component';
import { MOCK_RECENT_SEARCHES } from '../core/data/mock-recent-searches.data';
import { MOCK_CATEGORIES } from '../core/data/mock-categories.data';
import { MOCK_STORES } from '../core/data/mock-stores.data';
import { RecentSearchProduct } from '../core/models/recent-search.model';
import { Category } from '../core/models/category.model';
import { Store } from '../core/models/store.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ...IONIC_PAGE_IMPORTS,
    HomeGreetingComponent,
    HomeSearchComponent,
    HomeRecentSearchComponent,
    HomeCategoriesComponent,
    HomeStoresNearbyComponent,
  ],
})
export class HomePage {
  recentSearches = signal<RecentSearchProduct[]>(MOCK_RECENT_SEARCHES);
  categories = signal<Category[]>(MOCK_CATEGORIES);
  stores = signal<Store[]>(MOCK_STORES);
}
