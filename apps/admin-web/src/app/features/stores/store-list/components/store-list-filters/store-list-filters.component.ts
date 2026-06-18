import { ChangeDetectionStrategy, Component, model, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CityOption } from '../../../../../core/models/store.model';

@Component({
  selector: 'app-store-list-filters',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-list-filters.component.html'
})
export class StoreListFiltersComponent {
  readonly searchQuery = model.required<string>();
  readonly statusFilter = model.required<string>();
  readonly cityFilter = model.required<string>();
  readonly cities = input.required<CityOption[]>();
}
