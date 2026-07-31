import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Store } from '../../../../../core/models/store.model';

@Component({
  selector: 'app-store-list-table',
  standalone: true,
  imports: [RouterLink, NgbDropdownModule, MatPaginatorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-list-table.component.html'
})
export class StoreListTableComponent {
  readonly stores = input.required<Store[]>();
  readonly loading = input.required<boolean>();
  readonly totalStores = input.required<number>();
  readonly pageIndex = input.required<number>();
  readonly pageSize = input<number>(20);
  readonly hasActiveFilters = input<boolean>(false);

  readonly deleteStore = output<Store>();
  readonly pageChange = output<PageEvent>();
}
