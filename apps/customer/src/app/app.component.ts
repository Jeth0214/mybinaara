import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
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
    SplashScreen.hide({ fadeOutDuration: 400 });

    // Re-check location whenever the app returns from the background —
    // the user may have moved, or enabled location permission while away.
    App.addListener('resume', () => {
      this.locationService.initialize();
    });
  }
}