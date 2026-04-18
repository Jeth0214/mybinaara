import { Component, Input } from '@angular/core';
import { IONIC_PAGE_IMPORTS } from '../../imports/ionic-page-imports';
import { addIcons } from 'ionicons';
import { constructOutline } from 'ionicons/icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-under-construction',
  templateUrl: './under-construction.component.html',
  styleUrls: ['./under-construction.component.scss'],
  standalone: true,
  imports: [...IONIC_PAGE_IMPORTS, RouterLink],
})
export class UnderConstructionComponent {
  @Input() title: string = 'Under Construction';
  @Input() description: string = 'We are building something great for you. Please check back soon!';

  constructor() {
    addIcons({ constructOutline });
  }
}
