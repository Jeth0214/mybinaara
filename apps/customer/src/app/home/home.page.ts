import { Component } from '@angular/core';
import { IONIC_PAGE_IMPORTS } from '../shared/imports/ionic-page-imports';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [...IONIC_PAGE_IMPORTS],
})
export class HomePage {

}
