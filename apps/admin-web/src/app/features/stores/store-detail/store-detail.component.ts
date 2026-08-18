import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StoreService } from '../../../core/services/store.service';
import { ToastService } from '../../../core/services/toast.service';
import { Store, StoreStatus } from '../../../core/models/store.model';
import { StoreConfirmModalComponent } from '../components/store-confirm-modal/store-confirm-modal.component';

import { StoreDetailProfileComponent } from './components/store-detail-profile/store-detail-profile.component';
import { StoreDetailStatusComponent } from './components/store-detail-status/store-detail-status.component';
import { StoreDetailScheduleComponent } from './components/store-detail-schedule/store-detail-schedule.component';

@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    StoreDetailProfileComponent,
    StoreDetailStatusComponent,
    StoreDetailScheduleComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-detail.component.html',
  styleUrl: './store-detail.component.scss'
})
export class StoreDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storeService = inject(StoreService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private sub = new Subscription();

  readonly storeId = signal<number | null>(null);
  readonly store = signal<Store | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly mutating = signal(false);
  readonly busy = computed(() => this.loading() || this.mutating());

  // Status-change modal state
  readonly showStatusModal = signal(false);
  readonly targetStatus = signal<StoreStatus | null>(null);
  readonly statusReason = signal('');

  readonly todaySchedule = computed(() => {
    const s = this.store();
    if (!s || !s.schedule?.length) {
      return { isOpen: false, text: 'Closed (Schedule not configured)' };
    }

    const daysMap: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayKey = daysMap[new Date().getDay()];
    const daySched = s.schedule.find((item) => item.day === dayKey);

    if (!daySched || daySched.is_off) {
      return { isOpen: false, text: 'Closed Today' };
    }

    return { isOpen: true, text: `Open Today: ${daySched.open_time} - ${daySched.close_time}` };
  });

  ngOnInit(): void {
    this.sub.add(
      this.route.params.subscribe((params) => {
        const id = Number(params['id']);
        if (id) {
          this.storeId.set(id);
          this.fetchStore(id);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  fetchStore(id: number): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.notFound.set(false);

    this.storeService.getStore(id).subscribe({
      next: (store) => {
        this.loading.set(false);
        this.store.set(store);
      },
      error: (err) => {
        this.loading.set(false);
        const message: string = err?.message ?? '';
        if (message.toLowerCase().includes('no query results')) {
          this.notFound.set(true);
        } else {
          this.loadError.set(message || 'Failed to load this store.');
        }
      }
    });
  }

  openStatusModal(status: StoreStatus): void {
    this.targetStatus.set(status);
    this.statusReason.set('');
    this.showStatusModal.set(true);
  }

  closeStatusModal(): void {
    this.showStatusModal.set(false);
    this.targetStatus.set(null);
  }

  submitStatusChange(): void {
    const s = this.store();
    const status = this.targetStatus();
    if (!s || !status) return;

    if (status === 'rejected' && !this.statusReason().trim()) {
      this.toast.error('Please provide a reason for rejecting this store.');
      return;
    }

    if (status === 'suspended' && !this.statusReason().trim()) {
      this.toast.error('Please provide a reason for suspending this store.');
      return;
    }

    this.mutating.set(true);
    this.closeStatusModal();

    this.storeService.updateStoreStatus(s.id, status, this.statusReason().trim() || undefined).subscribe({
      next: (updated) => {
        this.mutating.set(false);
        this.store.set(updated);
        this.toast.success(`Store status changed to "${status}".`);
      },
      error: (err) => {
        this.mutating.set(false);
        this.toast.error(err?.message ?? 'Failed to update store status.');
      }
    });
  }

  deleteStore(): void {
    const s = this.store();
    if (!s) return;

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set('Delete Store Account');
    modalRef.componentInstance.message.set(
      `Are you sure you want to delete <strong>${s.name}</strong>?<br>This action cannot be undone and all merchant data will be permanently removed.`
    );
    modalRef.componentInstance.confirmText.set('Delete Store');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(true);

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) return;

        this.mutating.set(true);
        this.storeService.deleteStore(s.id).subscribe({
          next: () => {
            this.mutating.set(false);
            this.toast.success(`Store "${s.name}" has been deleted successfully.`);
            this.router.navigate(['/stores']);
          },
          error: (err) => {
            this.mutating.set(false);
            this.toast.error(err?.message ?? 'Failed to delete store.');
          }
        });
      },
      () => {}
    );
  }
}
