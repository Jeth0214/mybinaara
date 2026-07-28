import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { StaffService } from '../../../core/services/staff.service';
import { ToastService } from '../../../core/services/toast.service';
import { StaffMember } from '../../../core/models/staff.model';
import { AdminAuthState } from '../../../core/state/auth.state';
import { StoreConfirmModalComponent } from '../../stores/components/store-confirm-modal/store-confirm-modal.component';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-user-detail.component.html',
  styleUrl: './admin-user-detail.component.scss'
})
export class AdminUserDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly staffService = inject(StaffService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private readonly store = inject(Store);
  private sub = new Subscription();

  readonly adminId = signal<string | null>(null);
  readonly currentUser = this.store.selectSignal(AdminAuthState.user);
  readonly canManage = computed(() => !!this.currentUser()?.permissions.includes('staff.edit'));

  readonly admin = signal<StaffMember | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly mutating = signal(false);
  readonly busy = computed(() => this.loading() || this.mutating());

  readonly isSelf = computed(() => {
    const a = this.admin();
    return !!a && a.id === this.currentUser()?.id;
  });

  ngOnInit(): void {
    this.sub.add(
      this.route.params.subscribe(params => {
        const id = params['id'] || null;
        this.adminId.set(id);
        if (id) {
          this.fetchStaff(+id);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  fetchStaff(id: number): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.notFound.set(false);

    this.staffService.getStaff(id).subscribe({
      next: (staff) => {
        this.loading.set(false);
        this.admin.set(staff);
      },
      error: (err) => {
        this.loading.set(false);
        const message: string = err?.message ?? '';
        if (message.toLowerCase().includes('no query results')) {
          this.notFound.set(true);
        } else {
          this.loadError.set(message || 'Failed to load this user.');
        }
      },
    });
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  onToggleStatus(): void {
    const a = this.admin();
    if (!a) return;
    const activating = a.status === 'inactive';

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set(activating ? 'Activate User' : 'Deactivate User');
    modalRef.componentInstance.message.set(
      `Are you sure you want to mark <strong>${a.name}</strong> as ${activating ? 'active' : 'inactive'}?`
    );
    modalRef.componentInstance.confirmText.set(activating ? 'Activate' : 'Deactivate');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(!activating);

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) return;

        this.mutating.set(true);
        this.staffService.updateStaffStatus(a.id, activating ? 'active' : 'inactive').subscribe({
          next: (updated) => {
            this.mutating.set(false);
            this.admin.set(updated);
            this.toast.success(`"${a.name}" is now ${updated.status}.`);
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

  deleteAdmin(): void {
    const a = this.admin();
    if (!a) return;

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set('Delete User');
    modalRef.componentInstance.message.set(
      `Are you sure you want to delete <strong>${a.name}</strong>?<br>This action cannot be undone.`
    );
    modalRef.componentInstance.confirmText.set('Delete User');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(true);

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) return;

        this.mutating.set(true);
        this.staffService.deleteStaff(a.id).subscribe({
          next: () => {
            this.mutating.set(false);
            this.toast.success(`"${a.name}" has been deleted successfully.`);
            this.router.navigate(['/users/admins']);
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
