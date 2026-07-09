import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { UserCatalogService } from '../../../core/services/user-catalog.service';
import { ToastService } from '../../../core/services/toast.service';
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
  private readonly userCatalogService = inject(UserCatalogService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private readonly store = inject(Store);
  private sub = new Subscription();

  readonly adminId = signal<string | null>(null);
  readonly currentUser = this.store.selectSignal(AdminAuthState.user);
  readonly canManage = computed(() => this.currentUser()?.role === 'admin');

  readonly admin = computed(() => {
    const id = this.adminId();
    return id ? this.userCatalogService.admins().find(a => a.id === id) : null;
  });

  readonly isSelf = computed(() => {
    const a = this.admin();
    return !!a && a.id === this.currentUser()?.id;
  });

  ngOnInit(): void {
    this.sub.add(
      this.route.params.subscribe(params => {
        this.adminId.set(params['id'] || null);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  toggleStatus(): void {
    const a = this.admin();
    if (!a) return;
    const activating = a.status === 'suspended';

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set(activating ? 'Reactivate User' : 'Suspend User');
    modalRef.componentInstance.message.set(
      `Are you sure you want to ${activating ? 'reactivate' : 'suspend'} <strong>${a.name}</strong>?`
    );
    modalRef.componentInstance.confirmText.set(activating ? 'Reactivate' : 'Suspend');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(!activating);

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.userCatalogService.toggleAdminStatus(a.id);
          if (activating) {
            this.toast.success(`"${a.name}" has been reactivated.`);
          } else {
            this.toast.warning(`"${a.name}" has been suspended.`);
          }
        }
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
        if (confirmed) {
          this.userCatalogService.deleteAdminUser(a.id);
          this.toast.success(`"${a.name}" has been deleted successfully.`);
          this.router.navigate(['/users/admins']);
        }
      },
      () => {}
    );
  }
}
