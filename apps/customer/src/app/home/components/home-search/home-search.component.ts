import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { LocationService } from '../../../shared/services/location.service';

@Component({
  selector: 'app-home-search',
  templateUrl: './home-search.component.html',
  styleUrls: ['./home-search.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
})
export class HomeSearchComponent {
  private router = inject(Router);
  private locationService = inject(LocationService);

  currentLocation = this.locationService.locationLabel;
  locationLoading = this.locationService.loading;
  locationDenied = this.locationService.permissionDenied;

  navigateToSearch() {
    this.router.navigate(['/search']);
  }

  retryLocation() {
    this.locationService.initialize();
  }
}
