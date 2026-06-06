import { Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-search-empty-state',
  templateUrl: './search-empty-state.component.html',
  styleUrls: ['./search-empty-state.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class SearchEmptyStateComponent {
  hasQuery = input<boolean>(false);
  query = input<string>('');
}
