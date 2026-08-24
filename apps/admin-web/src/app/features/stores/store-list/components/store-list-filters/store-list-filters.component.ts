import { ChangeDetectionStrategy, Component, inject, model, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../../../../core/services/address.service';

@Component({
  selector: 'app-store-list-filters',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-list-filters.component.html'
})
export class StoreListFiltersComponent {
  private readonly addressService = inject(AddressService);

  readonly searchQuery = model.required<string>();
  readonly statusFilter = model.required<string>();
  readonly cityFilter = model.required<string>();
  readonly disabled = input<boolean>(false);

  readonly cities = [...this.addressService.getCities()].sort((a, b) => a.name_en.localeCompare(b.name_en));
}
