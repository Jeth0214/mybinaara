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
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Day';
  }
}
