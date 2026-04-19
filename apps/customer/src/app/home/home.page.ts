import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IONIC_PAGE_IMPORTS } from '../shared/imports/ionic-page-imports';
import { HomeGreetingComponent } from './components/home-greeting/home-greeting.component';
import { HomeSearchComponent } from './components/home-search/home-search.component';
import { MOCK_USER_PROFILE } from '../core/data/mock-profile.data';
import { UserProfile } from '../core/models/profile.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ...IONIC_PAGE_IMPORTS,
    HomeGreetingComponent,
    HomeSearchComponent
  ],
})
export class HomePage {
  userProfile = signal<UserProfile>(MOCK_USER_PROFILE);
}
