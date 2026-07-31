import { ChangeDetectionStrategy, Component, model, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  readonly disabled = input<boolean>(false);
}
