import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { registerGlobalIcons } from './shared/imports/ionic-icons-import';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    registerGlobalIcons();
    this.initializeTheme();
  }

  private initializeTheme() {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (isDark: boolean) => {
      document.documentElement.classList.toggle('ion-palette-dark', isDark);
      // Failsafe: clean up any lingering classes on body from previous local tests
      document.body.classList.toggle('ion-palette-dark', isDark);
    };

    if (theme === 'dark') {
      applyTheme(true);
    } else if (theme === 'light') {
      applyTheme(false);
    } else {
      // Support system default if no preference saved
      applyTheme(prefersDark.matches);
    }

    // Optional: listen for system changes if user hasn't overridden
    prefersDark.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches);
      }
    });
  }
}
