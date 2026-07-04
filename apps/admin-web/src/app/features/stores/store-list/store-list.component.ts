import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StoreService } from '../../../core/services/store.service';
import { ToastService } from '../../../core/services/toast.service';
import { Store, SAUDI_CITIES } from '../../../core/models/store.model';
import { StoreConfirmModalComponent } from '../components/store-confirm-modal/store-confirm-modal.component';
import { StoreListFiltersComponent } from './components/store-list-filters/store-list-filters.component';
import { StoreListTableComponent } from './components/store-list-table/store-list-table.component';

@Component({
  selector: 'app-store-list',
  standalone: true,
  imports: [RouterLink, StoreListFiltersComponent, StoreListTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-list.component.html',
  styleUrl: './store-list.component.scss'
})
export class StoreListComponent {
  private readonly storeService = inject(StoreService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);

  readonly cities = SAUDI_CITIES;

  // Loading Indicator Signal
  readonly loading = signal(true);

  // Signal filters
  readonly searchQuery = signal('');
  readonly statusFilter = signal('all');
  readonly cityFilter = signal('all');

  // Pagination Signals
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);

  // Master reactive data from service
  readonly allStores = this.storeService.stores;

  // Sliced stores for the current page
  readonly paginatedStores = computed(() => {
    const list = this.filteredStores();
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return list.slice(start, end);
  });

  constructor() {
    // Initial loading simulator
    setTimeout(() => this.loading.set(false), 650);

    // Reset page index on filter change
    effect(() => {
      this.searchQuery();
      this.statusFilter();
      this.cityFilter();
      
      untracked(() => {
        this.pageIndex.set(0);
      });
    });
  }

  // Signal-based filtering logic
  readonly filteredStores = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const city = this.cityFilter();

    return this.allStores().filter((store) => {
      // 1. Search filter
      const matchesSearch = !query || 
        store.name.toLowerCase().includes(query) ||
        store.crNumber.includes(query) ||
        store.ownerName.toLowerCase().includes(query) ||
        store.ownerEmail.toLowerCase().includes(query);

      // 2. Status filter
      const matchesStatus = status === 'all' || store.status === status;

      // 3. City filter
      const matchesCity = city === 'all' || store.location.city === city;

      return matchesSearch && matchesStatus && matchesCity;
    });
  });

  deleteStore(store: Store): void {
    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set('Delete Store Account');
    modalRef.componentInstance.message.set(
      `Are you sure you want to delete <strong>${store.name}</strong>?<br>This action cannot be undone and all merchant data will be permanently removed.`
    );
    modalRef.componentInstance.confirmText.set('Delete Store');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(true);

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.storeService.deleteStore(store.id);
          this.toast.success(`Store "${store.name}" has been deleted successfully.`);
        }
      },
      () => {}
    );
  }

  changePlan(storeId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newPlanId = target.value as 'basic' | 'premium' | 'enterprise';
    
    const store = this.storeService.getStoreById(storeId);
    if (!store) return;
    
    const oldPlanId = store.subscriptionPlanId;
    if (oldPlanId === newPlanId) return;

    // Temporarily reset select element visual state to the old value
    target.value = oldPlanId;

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set('Change Subscription Plan');
    modalRef.componentInstance.message.set(
      `Are you sure you want to change the subscription plan for <strong>${store.name}</strong> from <strong>${oldPlanId.toUpperCase()}</strong> to <strong>${newPlanId.toUpperCase()}</strong>?`
    );
    modalRef.componentInstance.confirmText.set('Change Plan');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(false);

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.storeService.assignSubscriptionPlan(storeId, newPlanId);
          this.toast.success(`Plan updated to "${newPlanId.toUpperCase()}" for ${store.name}.`);
          target.value = newPlanId;
        }
      },
      () => {}
    );
  }
}
