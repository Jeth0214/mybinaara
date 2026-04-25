import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { registerGlobalIcons } from './shared/imports/ionic-icons-import';
import { LocationService } from './shared/services/location.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private locationService = inject(LocationService);

  constructor() {
    registerGlobalIcons();
    this.locationService.initialize();
  }
}
