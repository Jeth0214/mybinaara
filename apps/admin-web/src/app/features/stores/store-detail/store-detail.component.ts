import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StoreService } from '../../../core/services/store.service';
import { ToastService } from '../../../core/services/toast.service';
import { Store, StoreStatus, DocumentType, DocumentStatus } from '../../../core/models/store.model';

@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-detail.component.html',
  styleUrl: './store-detail.component.scss'
})
export class StoreDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly storeService = inject(StoreService);
  private readonly toast = inject(ToastService);
  private sub = new Subscription();

  // Route State Signal
  readonly storeId = signal<string | null>(null);

  // Selected Tab Signal
  readonly activeTab = signal<'profile' | 'docs'>('profile');

  // Modal State Signals
  readonly showSuspendModal = signal(false);
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

    this.storeService.verifyDocument(s.id, type, 'approved');
    this.toast.success(`Document (${type.toUpperCase()}) approved.`);
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

    this.storeService.verifyDocument(s.id, type, 'rejected', reason);
    this.toast.warning(`Document (${type.toUpperCase()}) rejected.`);
    this.closeRejectDocModal();
  }

  activateStore(): void {
    const s = this.store();
    if (!s) return;

    // Check if any documents are pending or rejected
    const hasUnverifiedDocs = s.documents.some(doc => doc.status !== 'approved');
    if (hasUnverifiedDocs) {
      if (!confirm('This store has unapproved documents. Activating it will automatically mark all documents as Approved. Proceed?')) {
        return;
      }
    }

    this.storeService.updateStoreStatus(s.id, 'active');
    this.toast.success(`Store "${s.name}" is now active!`);
  }

  openSuspendModal(): void {
    this.suspensionReason.set('');
    this.showSuspendModal.set(true);
  }

  closeSuspendModal(): void {
    this.showSuspendModal.set(false);
  }

  submitSuspendStore(): void {
    const s = this.store();
    const reason = this.suspensionReason().trim();

    if (!s) return;
    if (!reason) {
      this.toast.error('Please provide a reason for suspending this store.');
      return;
    }

    this.storeService.updateStoreStatus(s.id, 'suspended', reason);
    this.toast.warning(`Store "${s.name}" is now suspended.`);
    this.closeSuspendModal();
  }

  rejectStore(): void {
    const s = this.store();
    if (!s) return;

    const reason = prompt('Please enter rejection reason for this store:');
    if (reason === null) return; // cancelled
    if (!reason.trim()) {
      this.toast.error('Rejection reason is required.');
      return;
    }

    this.storeService.updateStoreStatus(s.id, 'rejected', reason.trim());
    this.toast.error(`Store "${s.name}" registration rejected.`);
  }

  changePlan(planId: 'basic' | 'premium' | 'enterprise'): void {
    const s = this.store();
    if (!s) return;

    this.storeService.assignSubscriptionPlan(s.id, planId);
    this.toast.success(`Subscription plan updated to "${planId.toUpperCase()}".`);
  }

  resendCredentials(): void {
    const s = this.store();
    if (!s) return;

    this.toast.info(`Credentials and activation details re-sent to ${s.ownerEmail}.`);
  }
}
