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
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category, PaginationMeta } from '../../../core/models/category.model';
import { AdminAuthState } from '../../../core/state/auth.state';
import { StoreConfirmModalComponent } from '../../stores/components/store-confirm-modal/store-confirm-modal.component';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgbDropdownModule, MatPaginatorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.scss'
})
export class CategoryManagementComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private readonly store = inject(Store);

  readonly currentUser = this.store.selectSignal(AdminAuthState.user);
  readonly canManage = computed(() => !!this.currentUser()?.permissions.includes('catalog.manage'));

  readonly searchQuery = signal('');
  readonly statusFilter = signal<'all' | 'active' | 'inactive'>('all');

  readonly categories = signal<Category[]>([]);
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

          return this.categoryService.listCategories({ search: this.searchQuery().trim(), page, is_active: this.isActiveParam() }).pipe(
            catchError((err) => {
              this.loading.set(false);
              this.loadError.set(err?.message ?? 'Failed to load categories.');
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe((response) => {
        this.loading.set(false);
        this.categories.set(response.data);
        this.meta.set(response.meta);
      });

    merge(
      toObservable(this.searchQuery).pipe(skip(1), debounceTime(300), distinctUntilChanged()),
      toObservable(this.statusFilter).pipe(skip(1), distinctUntilChanged())
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadCategories(1));

    this.loadCategories(1);
  }

  private isActiveParam(): boolean | undefined {
    const filter = this.statusFilter();
    return filter === 'all' ? undefined : filter === 'active';
  }

  loadCategories(page: number): void {
    this.reload$.next(page);
  }

  handlePageEvent(event: PageEvent): void {
    this.loadCategories(event.pageIndex + 1);
  }

  toggleStatus(category: Category): void {
    const activating = !category.is_active;

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set(activating ? 'Enable Category' : 'Disable Category');
    modalRef.componentInstance.message.set(
      `Are you sure you want to ${activating ? 'enable' : 'disable'} <strong>${category.name}</strong>?`
    );
    modalRef.componentInstance.confirmText.set(activating ? 'Enable' : 'Disable');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(!activating);

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) return;

        this.mutating.set(true);
        this.categoryService.toggleCategoryStatus(category.id).subscribe({
          next: (updated) => {
            this.mutating.set(false);
            this.categories.update((list) => list.map((c) => (c.id === updated.id ? updated : c)));
            this.toast.success(`"${category.name}" is now ${updated.is_active ? 'active' : 'disabled'}.`);
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

  deleteCategory(category: Category): void {
    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set('Delete Category');
    modalRef.componentInstance.message.set(
      `Are you sure you want to delete <strong>${category.name}</strong>?<br>This action cannot be undone.`
    );
    modalRef.componentInstance.confirmText.set('Delete Category');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(true);

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) return;

        this.mutating.set(true);
        this.categoryService.deleteCategory(category.id).subscribe({
          next: () => {
            this.mutating.set(false);
            this.toast.success(`"${category.name}" has been deleted successfully.`);
            this.loadCategories(this.meta()?.current_page ?? 1);
          },
          error: (err) => {
            this.mutating.set(false);
            this.toast.error(err?.message ?? 'Failed to delete category.');
          },
        });
      },
      () => {}
    );
  }
}
