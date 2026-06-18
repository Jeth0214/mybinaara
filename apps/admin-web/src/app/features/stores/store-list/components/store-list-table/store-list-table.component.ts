import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Store } from '../../../../../core/models/store.model';
import { UserCatalogService } from '../../../../../core/services/user-catalog.service';

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
  readonly pageSize = input.required<number>();
  readonly pageIndex = input.required<number>();

  readonly deleteStore = output<Store>();
  readonly changePlan = output<{ storeId: string, event: Event }>();
  readonly pageChange = output<PageEvent>();

  private readonly catalogService = inject(UserCatalogService);

  getProductCount(storeId: string): number {
    return this.catalogService.products().filter(p => p.storeId === storeId).length;
  }
}
