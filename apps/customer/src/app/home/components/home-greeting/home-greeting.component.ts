import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonBadge, IonButton } from '@ionic/angular/standalone';
import { UserProfile } from '../../../core/models/profile.model';

@Component({
  selector: 'app-home-greeting',
  templateUrl: './home-greeting.component.html',
  styleUrls: ['./home-greeting.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonBadge, IonButton]
})
export class HomeGreetingComponent {
  profile = input<UserProfile>();
}
