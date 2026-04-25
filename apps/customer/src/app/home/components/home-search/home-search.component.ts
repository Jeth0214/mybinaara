import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home-search',
  templateUrl: './home-search.component.html',
  styleUrls: ['./home-search.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class HomeSearchComponent implements OnInit {
  currentLocation = signal<string>('Locating...');

  ngOnInit() {
    if (!navigator.geolocation) {
      this.currentLocation.set('Location unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.address ?? {};
          const city = addr.city ?? addr.town ?? addr.village ?? addr.county ?? '';
          const suburb = addr.suburb ?? addr.neighbourhood ?? addr.district ?? '';
          this.currentLocation.set(
            city && suburb ? `${city}, ${suburb}` : city || suburb || 'Location found'
          );
        } catch {
          this.currentLocation.set('Location unavailable');
        }
      },
      () => this.currentLocation.set('Location unavailable'),
      { timeout: 8000 }
    );
  }
}
