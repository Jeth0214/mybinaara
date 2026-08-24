import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { ViewWillEnter } from '@ionic/angular';
import { IONIC_PAGE_IMPORTS } from '../shared/imports/ionic-page-imports';
import { HomeGreetingComponent } from './components/home-greeting/home-greeting.component';
import { HomeSearchComponent } from './components/home-search/home-search.component';
import { HomeRecentSearchComponent } from './components/home-recent-search/home-recent-search.component';
import { HomeCategoriesComponent } from './components/home-categories/home-categories.component';
import { HomeStoresNearbyComponent } from './components/home-stores-nearby/home-stores-nearby.component';
import { RecentViewsService } from '../shared/services/recent-views.service';
import { LocationService } from '../shared/services/location.service';
import { CategoryService } from '../shared/services/category.service';
import { StoreService } from '../shared/services/store.service';
import { Category } from '../core/models/category.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonIcon,
    ...IONIC_PAGE_IMPORTS,
    HomeGreetingComponent,
    HomeSearchComponent,
    HomeRecentSearchComponent,
    HomeCategoriesComponent,
    HomeStoresNearbyComponent,
  ],
})
export class HomePage implements ViewWillEnter {
  private router = inject(Router);
  private recentViewsService = inject(RecentViewsService);
  locationService = inject(LocationService);
  private categoryService = inject(CategoryService);
  private storeService = inject(StoreService);

  /** Skips the very first entry — AppComponent's boot-time initialize()
   *  already covers that — and re-fetches on every subsequent re-entry
   *  (tab switch back, back-navigation), per the "refresh Home → get
   *  latest location" requirement. */
  private hasEnteredBefore = false;

  readonly locationLoading = this.locationService.loading;
  readonly locationCoords  = this.locationService.coords;
  readonly skeletonItems   = [1, 2, 3];

  recentSearches = this.recentViewsService.recentViews;
  categories = this.categoryService.categories;
  categoriesLoading = this.categoryService.loading;
  categoriesError = this.categoryService.error;
  stores = this.storeService.stores;
  storesLoading = this.storeService.loading;
  storesError = this.storeService.error;

  constructor() {
    this.categoryService.ensureLoaded();
    effect(() => {
      const coords = this.locationService.coords();
      if (coords) {
        this.storeService.ensureLoaded(coords.lat, coords.lng);
      }
    });
  }

  ionViewWillEnter(): void {
    if (!this.hasEnteredBefore) {
      this.hasEnteredBefore = true;
      return;
    }
    this.locationService.initialize();
  }

  retryLocation(): void {
    this.locationService.initialize();
  }

  onCategorySelected(category: Category) {
    this.router.navigate(['/search'], { queryParams: { cat: category.name } });
  }
}
