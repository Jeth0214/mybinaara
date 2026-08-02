import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PageEvent } from '@angular/material/paginator';
import { EMPTY, Subject, merge } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, skip, switchMap } from 'rxjs/operators';
import { StoreService } from '../../../core/services/store.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationMeta, Store, StoreStatus } from '../../../core/models/store.model';
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

  readonly searchQuery = signal('');
  readonly statusFilter = signal<'all' | StoreStatus>('all');
  readonly cityFilter = signal<'all' | string>('all');

  readonly stores = signal<Store[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly mutating = signal(false);

  readonly hasActiveFilters = computed(
    () => this.searchQuery().trim() !== '' || this.statusFilter() !== 'all' || this.cityFilter() !== 'all'
  );

  /** True once we know the directory has no stores at all (not just no matches for the current filters). */
  readonly isDirectoryEmpty = computed(
    () => !this.loading() && !this.hasActiveFilters() && (this.meta()?.total ?? 0) === 0
  );

  /** Every fetch (search, pagination, retry, post-mutation refresh) goes through
   *  this single switchMap pipeline, so a newer request always cancels an
   *  older one still in flight. */
  private readonly reload$ = new Subject<number>();

  constructor() {
    this.reload$
      .pipe(
        switchMap((page) => {
          this.loading.set(true);
          this.loadError.set(null);

          return this.storeService
            .listStores({
              search: this.searchQuery().trim(),
              status: this.statusFilter(),
              city_id: this.cityFilter() === 'all' ? 'all' : Number(this.cityFilter()),
              page,
            })
            .pipe(
              catchError((err) => {
                this.loading.set(false);
                this.loadError.set(err?.message ?? 'Failed to load stores.');
                return EMPTY;
              })
            );
        }),
        takeUntilDestroyed()
      )
      .subscribe((response) => {
        this.loading.set(false);
        this.stores.set(response.data);
        this.meta.set(response.meta);
      });

    merge(
      toObservable(this.searchQuery).pipe(skip(1), debounceTime(300), distinctUntilChanged()),
      toObservable(this.statusFilter).pipe(skip(1), distinctUntilChanged()),
      toObservable(this.cityFilter).pipe(skip(1), distinctUntilChanged())
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadStores(1));

    this.loadStores(1);
  }

  loadStores(page: number): void {
    this.reload$.next(page);
  }

  handlePageEvent(event: PageEvent): void {
    this.loadStores(event.pageIndex + 1);
  }

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
        if (!confirmed) return;

        this.mutating.set(true);
        this.storeService.deleteStore(store.id).subscribe({
          next: () => {
            this.mutating.set(false);
            this.toast.success(`Store "${store.name}" has been deleted successfully.`);
            this.loadStores(this.meta()?.current_page ?? 1);
          },
          error: (err) => {
            this.mutating.set(false);
            this.toast.error(err?.message ?? 'Failed to delete store.');
          },
        });
      },
      () => {}
    );
  }
}
