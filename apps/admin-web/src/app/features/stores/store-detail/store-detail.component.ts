import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StoreService } from '../../../core/services/store.service';
import { ToastService } from '../../../core/services/toast.service';
import { Store, StoreStatus, DocumentType, DocumentStatus } from '../../../core/models/store.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StoreConfirmModalComponent } from '../components/store-confirm-modal/store-confirm-modal.component';

import { StoreDetailProfileComponent } from './components/store-detail-profile/store-detail-profile.component';
import { StoreDetailDocumentsComponent } from './components/store-detail-documents/store-detail-documents.component';
import { StoreDetailStatusComponent } from './components/store-detail-status/store-detail-status.component';
import { StoreDetailCredentialsComponent } from './components/store-detail-credentials/store-detail-credentials.component';
import { StoreDetailProductsComponent } from './components/store-detail-products/store-detail-products.component';
import { StoreDetailScheduleComponent } from './components/store-detail-schedule/store-detail-schedule.component';

@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    StoreDetailProfileComponent,
    StoreDetailDocumentsComponent,
    StoreDetailStatusComponent,
    StoreDetailCredentialsComponent,
    StoreDetailProductsComponent,
    StoreDetailScheduleComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-detail.component.html',
  styleUrl: './store-detail.component.scss'
})
export class StoreDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly storeService = inject(StoreService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private sub = new Subscription();

  // Route State Signal
  readonly storeId = signal<string | null>(null);

  // Loading Indicator Signal
  readonly loading = signal(false);

  // Selected Tab Signal
  readonly activeTab = signal<'profile' | 'docs'>('profile');

  // Modal State Signals
  readonly showSuspendModal = signal(false);
  readonly selectedSuspensionOption = signal('');
  readonly suspensionReason = signal('');
  readonly showRejectDocModal = signal(false);
  readonly rejectDocType = signal<DocumentType | null>(null);
  readonly rejectionReason = signal('');

  // Selected Document for preview
  readonly selectedDocType = signal<DocumentType>('cr');

  // Computed Store Record
  readonly store = computed(() => {
    const id = this.storeId();
    return id ? this.storeService.stores().find(s => s.id === id) : null;
  });

  // Selected Document Data
  readonly currentDocument = computed(() => {
    const s = this.store();
    const type = this.selectedDocType();
    return s?.documents.find(d => d.type === type) || null;
  });

  // Computed Today's Schedule for the header badge
  readonly todaySchedule = computed(() => {
    const s = this.store();
    if (!s || !s.schedule) {
      return { isOpen: false, text: 'Closed (Schedule not configured)' };
    }

    const daysMap: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const currentDayIndex = new Date().getDay();
    const dayKey = daysMap[currentDayIndex];
    const daySched = s.schedule.find(item => item.day === dayKey);

    if (!daySched || daySched.isOff) {
      return { isOpen: false, text: 'Closed Today' };
    }

    return {
      isOpen: true,
      text: `Open Today: ${daySched.openTime} - ${daySched.closeTime}`
    };
  });


  ngOnInit(): void {
    this.sub.add(
      this.route.params.subscribe(params => {
        this.storeId.set(params['id'] || null);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  changeTab(tab: 'profile' | 'docs'): void {
    this.activeTab.set(tab);
  }

  selectDoc(type: DocumentType): void {
    this.selectedDocType.set(type);
  }

  approveDocument(type: DocumentType): void {
    const s = this.store();
    if (!s) return;

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set('Approve Document');
    modalRef.componentInstance.message.set(
      `Are you sure you want to approve the <strong>${type.toUpperCase()}</strong> document for <strong>${s.name}</strong>?`
    );
    modalRef.componentInstance.confirmText.set('Approve');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(false);

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.loading.set(true);
          setTimeout(() => {
            this.storeService.verifyDocument(s.id, type, 'approved');
            this.toast.success(`Document (${type.toUpperCase()}) approved.`);
            this.loading.set(false);
          }, 600);
        }
      },
      () => {}
    );
  }

  openRejectDocModal(type: DocumentType): void {
    this.rejectDocType.set(type);
    this.rejectionReason.set('');
    this.showRejectDocModal.set(true);
  }

  closeRejectDocModal(): void {
    this.showRejectDocModal.set(false);
    this.rejectDocType.set(null);
  }

  submitRejectDocument(): void {
    const s = this.store();
    const type = this.rejectDocType();
    const reason = this.rejectionReason().trim();

    if (!s || !type) return;
    if (!reason) {
      this.toast.error('Please provide a reason for rejecting this document.');
      return;
    }

    this.loading.set(true);
    this.closeRejectDocModal();

    setTimeout(() => {
      this.storeService.verifyDocument(s.id, type, 'rejected', reason);
      this.toast.warning(`Document (${type.toUpperCase()}) rejected.`);
      this.loading.set(false);
    }, 600);
  }

  activateStore(): void {
    const s = this.store();
    if (!s) return;

    const isReactivating = s.status === 'suspended';
    const actionWord = isReactivating ? 'reactivate' : 'activate';

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set(`${isReactivating ? 'Reactivate' : 'Activate'} Store Account`);
    modalRef.componentInstance.message.set(
      `Are you sure you want to ${actionWord} the store account <strong>${s.name}</strong>?`
    );
    modalRef.componentInstance.confirmText.set(isReactivating ? 'Reactivate' : 'Activate');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(false);

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.loading.set(true);
          setTimeout(() => {
            this.storeService.updateStoreStatus(s.id, 'active');
            this.toast.success(`Store "${s.name}" is now active!`);
            this.loading.set(false);
          }, 600);
        }
      },
      () => {}
    );
  }

  openSuspendModal(): void {
    this.selectedSuspensionOption.set('');
    this.suspensionReason.set('');
    this.showSuspendModal.set(true);
  }

  closeSuspendModal(): void {
    this.showSuspendModal.set(false);
  }

  submitSuspendStore(): void {
    const s = this.store();
    const option = this.selectedSuspensionOption();
    let reason = '';

    if (option === 'Other') {
      reason = this.suspensionReason().trim();
    } else {
      reason = option;
    }

    if (!s) return;
    if (!option) {
      this.toast.error('Please select a suspension reason.');
      return;
    }
    if (option === 'Other' && !reason) {
      this.toast.error('Please specify the reason for suspension.');
      return;
    }

    this.loading.set(true);
    this.closeSuspendModal();

    setTimeout(() => {
      this.storeService.updateStoreStatus(s.id, 'suspended', reason);
      this.toast.warning(`Store "${s.name}" is now suspended.`);
      this.loading.set(false);
    }, 600);
  }

  resendCredentials(): void {
    const s = this.store();
    if (!s) return;

    this.toast.info(`Credentials and activation details re-sent to ${s.ownerEmail}.`);
  }
}
