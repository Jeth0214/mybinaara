import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { IONIC_PAGE_IMPORTS } from '../shared/imports/ionic-page-imports';
import { HomeGreetingComponent } from './components/home-greeting/home-greeting.component';
import { HomeSearchComponent } from './components/home-search/home-search.component';
import { HomeRecentSearchComponent } from './components/home-recent-search/home-recent-search.component';
import { HomeCategoriesComponent } from './components/home-categories/home-categories.component';
import { HomeStoresNearbyComponent } from './components/home-stores-nearby/home-stores-nearby.component';
import { MOCK_CATEGORIES } from '../core/data/mock-categories.data';
import { MOCK_STORES } from '../core/data/mock-stores.data';
import { RecentViewsService } from '../shared/services/recent-views.service';
import { LocationService } from '../shared/services/location.service';
import { Category } from '../core/models/category.model';
import { Store } from '../core/models/store.model';

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
export class HomePage {
  private router = inject(Router);
  private recentViewsService = inject(RecentViewsService);
  private locationService = inject(LocationService);

  readonly locationLoading = this.locationService.loading;
  readonly locationCoords  = this.locationService.coords;
  readonly locationDenied  = this.locationService.permissionDenied;
  readonly skeletonItems   = [1, 2, 3];

  recentSearches = this.recentViewsService.recentViews;
  categories = signal<Category[]>(MOCK_CATEGORIES);
  stores = signal<Store[]>(MOCK_STORES);

  retryLocation(): void {
    this.locationService.initialize();
  }

  async openAppSettings(): Promise<void> {
    await NativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App,
    });
  }

  onCategorySelected(category: Category) {
    this.router.navigate(['/search'], { queryParams: { cat: category.name } });
  }
}
