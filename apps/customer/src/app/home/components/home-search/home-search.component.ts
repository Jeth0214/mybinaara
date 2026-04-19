import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home-search',
  templateUrl: './home-search.component.html',
  styleUrls: ['./home-search.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class HomeSearchComponent {
  // In a real implementation this might use a service to get the current location
  currentLocation = 'Riyadh, Al Olaya';
}
