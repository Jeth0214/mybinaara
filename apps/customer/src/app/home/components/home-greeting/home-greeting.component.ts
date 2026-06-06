import { Component } from '@angular/core';

@Component({
  selector: 'app-home-greeting',
  templateUrl: './home-greeting.component.html',
  styleUrls: ['./home-greeting.component.scss'],
  standalone: true,
  imports: []
})
export class HomeGreetingComponent {
  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    } else if (hour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  }
}
