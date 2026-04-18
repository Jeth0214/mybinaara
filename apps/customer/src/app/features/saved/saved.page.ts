import { Component } from '@angular/core';
import { IONIC_PAGE_IMPORTS } from '../../shared/imports/ionic-page-imports';
import { UnderConstructionComponent } from '../../shared/components/under-construction/under-construction.component';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.page.html',
  styleUrls: ['./saved.page.scss'],
  standalone: true,
  imports: [
    ...IONIC_PAGE_IMPORTS,
    UnderConstructionComponent
  ],
})
export class SavedPage {
  constructor() {}
}
