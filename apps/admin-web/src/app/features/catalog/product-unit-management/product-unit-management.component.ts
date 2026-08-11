import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Store } from '@ngxs/store';
import { EMPTY, Subject, merge } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, skip, switchMap } from 'rxjs/operators';
import { ProductUnitService } from '../../../core/services/product-unit.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductUnit, PaginationMeta } from '../../../core/models/product-unit.model';
import { AdminAuthState } from '../../../core/state/auth.state';
import { ADMIN_PERMISSIONS } from '../../../core/models/auth.model';
import { StoreConfirmModalComponent } from '../../stores/components/store-confirm-modal/store-confirm-modal.component';

@Component({
  selector: 'app-product-unit-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgbDropdownModule, MatPaginatorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-unit-management.component.html',
  styleUrl: './product-unit-management.component.scss'
})
export class ProductUnitManagementComponent {
  private readonly unitService = inject(ProductUnitService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private readonly store = inject(Store);

  readonly currentUser = this.store.selectSignal(AdminAuthState.user);
  readonly canCreate = computed(() => !!this.currentUser()?.permissions.includes(ADMIN_PERMISSIONS.PRODUCT_UNITS_CREATE));
  readonly canEdit = computed(() => !!this.currentUser()?.permissions.includes(ADMIN_PERMISSIONS.PRODUCT_UNITS_EDIT));
  readonly canDelete = computed(() => !!this.currentUser()?.permissions.includes(ADMIN_PERMISSIONS.PRODUCT_UNITS_DELETE));
  readonly canManageAny = computed(() => this.canCreate() || this.canEdit() || this.canDelete());

  readonly searchQuery = signal('');
  readonly statusFilter = signal<'all' | 'active' | 'inactive'>('all');

  readonly units = signal<ProductUnit[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly mutating = signal(false);
  readonly busy = computed(() => this.loading() || this.mutating());

  /** Every fetch (search, pagination, retry, post-mutation refresh) goes through
   *  this single switchMap pipeline, so a newer request always cancels an
   *  older one still in flight — not just for search. */
  private readonly reload$ = new Subject<number>();

  constructor() {
    this.reload$
      .pipe(
        switchMap((page) => {
          this.loading.set(true);
          this.loadError.set(null);

          return this.unitService.listProductUnits({ search: this.searchQuery().trim(), page, is_active: this.isActiveParam() }).pipe(
            catchError((err) => {
              this.loading.set(false);
              this.loadError.set(err?.message ?? 'Failed to load product units.');
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe((response) => {
        this.loading.set(false);
        this.units.set(response.data);
        this.meta.set(response.meta);
      });

    merge(
      toObservable(this.searchQuery).pipe(skip(1), debounceTime(300), distinctUntilChanged()),
      toObservable(this.statusFilter).pipe(skip(1), distinctUntilChanged())
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadUnits(1));

    this.loadUnits(1);
  }

  private isActiveParam(): boolean | undefined {
    const filter = this.statusFilter();
    return filter === 'all' ? undefined : filter === 'active';
  }

  loadUnits(page: number): void {
    this.reload$.next(page);
  }

  handlePageEvent(event: PageEvent): void {
    this.loadUnits(event.pageIndex + 1);
  }

  toggleStatus(unit: ProductUnit): void {
    const activating = !unit.is_active;

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set(activating ? 'Enable Unit' : 'Disable Unit');
    modalRef.componentInstance.message.set(
      `Are you sure you want to ${activating ? 'enable' : 'disable'} <strong>${unit.name}</strong>?`
    );
    modalRef.componentInstance.confirmText.set(activating ? 'Enable' : 'Disable');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(!activating);

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) return;

        this.mutating.set(true);
        this.unitService.updateProductUnit(unit.id, { is_active: activating }).subscribe({
          next: (updated) => {
            this.mutating.set(false);
            this.units.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
            this.toast.success(`"${unit.name}" is now ${updated.is_active ? 'active' : 'disabled'}.`);
          },
          error: (err) => {
            this.mutating.set(false);
            this.toast.error(err?.message ?? 'Failed to update status.');
          },
        });
      },
      () => {}
    );
  }

  deleteUnit(unit: ProductUnit): void {
    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set('Delete Unit');
    modalRef.componentInstance.message.set(
      `Are you sure you want to delete <strong>${unit.name}</strong>?<br>This action cannot be undone.`
    );
    modalRef.componentInstance.confirmText.set('Delete Unit');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(true);

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) return;

        this.mutating.set(true);
        this.unitService.deleteProductUnit(unit.id).subscribe({
          next: () => {
            this.mutating.set(false);
            this.toast.success(`"${unit.name}" has been deleted successfully.`);
            this.loadUnits(this.meta()?.current_page ?? 1);
          },
          error: (err) => {
            this.mutating.set(false);
            this.toast.error(err?.message ?? 'Failed to delete unit.');
          },
        });
      },
      () => {}
    );
  }
}
