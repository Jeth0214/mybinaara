import { Component } from '@angular/core';
import { IONIC_PAGE_IMPORTS } from './shared/imports/ionic-page-imports';
import { addIcons } from 'ionicons';
import { personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [...IONIC_PAGE_IMPORTS],
})
export class AppComponent {
  constructor() {
    addIcons({ personOutline });
    this.initializeTheme();
  }

  private initializeTheme() {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Helper to apply theme
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
