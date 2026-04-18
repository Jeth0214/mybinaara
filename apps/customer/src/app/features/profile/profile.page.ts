import { Component, OnInit } from '@angular/core';
import { IONIC_PAGE_IMPORTS } from '../../shared/imports/ionic-page-imports';
import { addIcons } from 'ionicons';
import { sunnyOutline, moonOutline } from 'ionicons/icons';
import { UnderConstructionComponent } from '../../shared/components/under-construction/under-construction.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    ...IONIC_PAGE_IMPORTS,
    UnderConstructionComponent
  ],
})
export class ProfilePage implements OnInit {
  isDarkMode: boolean = false;

  constructor() {
    addIcons({ sunnyOutline, moonOutline });
  }

  ngOnInit() {
    this.isDarkMode = document.documentElement.classList.contains('ion-palette-dark');
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('ion-palette-dark', this.isDarkMode);
    document.body.classList.toggle('ion-palette-dark', this.isDarkMode); // Failsafe
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }
}
