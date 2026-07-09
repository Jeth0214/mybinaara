import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Store } from '@ngxs/store';
import { UserCatalogService } from '../../../core/services/user-catalog.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminUser } from '../../../core/models/user.model';
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
  private readonly userCatalogService = inject(UserCatalogService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private readonly store = inject(Store);

  readonly currentUser = this.store.selectSignal(AdminAuthState.user);
  readonly canManage = computed(() => this.currentUser()?.role === 'admin');

  readonly searchQuery = signal('');
  readonly roleFilter = signal('all');
  readonly statusFilter = signal('all');

  // Pagination Signals
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);

  readonly allAdmins = this.userCatalogService.admins;

  constructor() {
    // Reset page index on filter change
    effect(() => {
      this.searchQuery();
      this.roleFilter();
      this.statusFilter();

      untracked(() => {
        this.pageIndex.set(0);
      });
    });
  }

  readonly filteredAdmins = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const role = this.roleFilter();
    const status = this.statusFilter();

    return this.allAdmins().filter(admin => {
      const matchesSearch = !query ||
        admin.name.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query);

      const matchesRole = role === 'all' || admin.role === role;
      const matchesStatus = status === 'all' || admin.status === status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  });

  readonly paginatedAdmins = computed(() => {
    const list = this.filteredAdmins();
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return list.slice(start, end);
  });

  handlePageEvent(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  toggleStatus(admin: AdminUser): void {
    const activating = admin.status === 'suspended';

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set(activating ? 'Reactivate User' : 'Suspend User');
    modalRef.componentInstance.message.set(
      `Are you sure you want to ${activating ? 'reactivate' : 'suspend'} <strong>${admin.name}</strong>?`
    );
    modalRef.componentInstance.confirmText.set(activating ? 'Reactivate' : 'Suspend');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(!activating);

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.userCatalogService.toggleAdminStatus(admin.id);
          if (activating) {
            this.toast.success(`"${admin.name}" has been reactivated.`);
          } else {
            this.toast.warning(`"${admin.name}" has been suspended.`);
          }
        }
      },
      () => {}
    );
  }

  deleteAdmin(admin: AdminUser): void {
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
        if (confirmed) {
          this.userCatalogService.deleteAdminUser(admin.id);
          this.toast.success(`"${admin.name}" has been deleted successfully.`);
        }
      },
      () => {}
    );
  }
}
