import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Store } from '@ngxs/store';
import { EMPTY, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, skip, switchMap } from 'rxjs/operators';
import { StaffService } from '../../../core/services/staff.service';
import { ToastService } from '../../../core/services/toast.service';
import { StaffMember, PaginationMeta } from '../../../core/models/staff.model';
import { AdminAuthState } from '../../../core/state/auth.state';
import { StoreConfirmModalComponent } from '../../stores/components/store-confirm-modal/store-confirm-modal.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgbDropdownModule, MatPaginatorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent {
  private readonly staffService = inject(StaffService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private readonly store = inject(Store);

  readonly currentUser = this.store.selectSignal(AdminAuthState.user);
  readonly canManage = computed(() => !!this.currentUser()?.permissions.includes('staff.edit'));

  readonly searchQuery = signal('');

  readonly staffList = signal<StaffMember[]>([]);
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

          return this.staffService.listStaff({ search: this.searchQuery().trim(), page }).pipe(
            catchError((err) => {
              this.loading.set(false);
              this.loadError.set(err?.message ?? 'Failed to load users.');
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe((response) => {
        this.loading.set(false);
        this.staffList.set(response.data);
        this.meta.set(response.meta);
      });

    toObservable(this.searchQuery)
      .pipe(skip(1), debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.loadStaff(1));

    this.loadStaff(1);
  }

  loadStaff(page: number): void {
    this.reload$.next(page);
  }

  handlePageEvent(event: PageEvent): void {
    this.loadStaff(event.pageIndex + 1);
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  onToggleStatus(admin: StaffMember): void {
    const activating = admin.status === 'inactive';

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set(activating ? 'Activate User' : 'Deactivate User');
    modalRef.componentInstance.message.set(
      `Are you sure you want to mark <strong>${admin.name}</strong> as ${activating ? 'active' : 'inactive'}?`
    );
    modalRef.componentInstance.confirmText.set(activating ? 'Activate' : 'Deactivate');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(!activating);

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) return;

        this.mutating.set(true);
        this.staffService.updateStaffStatus(admin.id, activating ? 'active' : 'inactive').subscribe({
          next: (updated) => {
            this.mutating.set(false);
            this.staffList.update((list) => list.map((a) => (a.id === updated.id ? updated : a)));
            this.toast.success(`"${admin.name}" is now ${updated.status}.`);
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

  deleteAdmin(admin: StaffMember): void {
    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set('Delete User');
    modalRef.componentInstance.message.set(
      `Are you sure you want to delete <strong>${admin.name}</strong>?<br>This action cannot be undone.`
    );
    modalRef.componentInstance.confirmText.set('Delete User');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(true);

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) return;

        this.mutating.set(true);
        this.staffService.deleteStaff(admin.id).subscribe({
          next: () => {
            this.mutating.set(false);
            this.toast.success(`"${admin.name}" has been deleted successfully.`);
            this.loadStaff(this.meta()?.current_page ?? 1);
          },
          error: (err) => {
            this.mutating.set(false);
            this.toast.error(err?.message ?? 'Failed to delete user.');
          },
        });
      },
      () => {}
    );
  }
}
