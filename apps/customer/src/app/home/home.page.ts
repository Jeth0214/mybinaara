import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IONIC_PAGE_IMPORTS } from '../shared/imports/ionic-page-imports';
import { HomeGreetingComponent } from './components/home-greeting/home-greeting.component';
import { HomeSearchComponent } from './components/home-search/home-search.component';
import { HomeRecentSearchComponent } from './components/home-recent-search/home-recent-search.component';
import { MOCK_USER_PROFILE } from '../core/data/mock-profile.data';
import { MOCK_AUTH_STATE } from '../core/data/mock-auth.data';
import { MOCK_RECENT_SEARCHES } from '../core/data/mock-recent-searches.data';
import { UserProfile } from '../core/models/profile.model';
import { AuthState } from '../core/models/auth.model';
import { RecentSearchProduct } from '../core/models/recent-search.model';

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
  ],
})
export class HomePage {
  userProfile = signal<UserProfile>(MOCK_USER_PROFILE);
  authState = signal<AuthState>(MOCK_AUTH_STATE);
  recentSearches = signal<RecentSearchProduct[]>(MOCK_RECENT_SEARCHES);

  // Derived values via computed()
  isLoggedIn = computed(() => this.authState().isLoggedIn);
}
