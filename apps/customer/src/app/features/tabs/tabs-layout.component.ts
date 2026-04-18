import { Component } from '@angular/core';
import { IONIC_PAGE_IMPORTS } from '../../shared/imports/ionic-page-imports';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  searchOutline, 
  locationOutline, 
  bookmarkOutline, 
  personOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs-layout',
  templateUrl: './tabs-layout.component.html',
  styleUrls: ['./tabs-layout.component.scss'],
  standalone: true,
  imports: [
    ...IONIC_PAGE_IMPORTS
  ],
})
export class TabsLayoutComponent {
  constructor() {
    addIcons({ 
      homeOutline, 
      searchOutline, 
      locationOutline, 
      bookmarkOutline, 
      personOutline 
    });
  }
}
