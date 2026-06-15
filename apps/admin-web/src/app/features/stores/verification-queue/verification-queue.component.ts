import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../core/services/store.service';
import { ToastService } from '../../../core/services/toast.service';
import { Store, StoreStatus, DocumentType, DocumentStatus, StoreDocument } from '../../../core/models/store.model';

@Component({
  selector: 'app-verification-queue',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './verification-queue.component.html',
  styleUrl: './verification-queue.component.scss'
})
export class VerificationQueueComponent {
  private readonly storeService = inject(StoreService);
  private readonly toast = inject(ToastService);

  // Master reactive computed signal for pending stores
  readonly pendingStores = this.storeService.pendingVerificationStores;

  // Selected Store for Side Drawer review
  readonly selectedStoreId = signal<string | null>(null);

  // Selected Document Type for review in drawer
  readonly selectedDocType = signal<DocumentType>('cr');

  // Drawer Open state
  readonly isDrawerOpen = signal(false);

  // Rejection modal state
  readonly showRejectModal = signal(false);
  readonly rejectDocType = signal<DocumentType | null>(null);
  readonly rejectionReason = signal('');

  // Computed selected store details
  readonly selectedStore = computed(() => {
    const id = this.selectedStoreId();
    return id ? this.storeService.stores().find(s => s.id === id) : null;
  });

  // Computed selected document record
  readonly currentDocument = computed(() => {
    const s = this.selectedStore();
    const type = this.selectedDocType();
    return s?.documents.find(d => d.type === type) || null;
  });

  openReviewDrawer(storeId: string): void {
    this.selectedStoreId.set(storeId);
    this.selectedDocType.set('cr');
    this.isDrawerOpen.set(true);
  }

  closeReviewDrawer(): void {
    this.isDrawerOpen.set(false);
    this.selectedStoreId.set(null);
  }

  selectDoc(type: DocumentType): void {
    this.selectedDocType.set(type);
  }

  approveDoc(type: DocumentType): void {
    const s = this.selectedStore();
    if (!s) return;

    this.storeService.verifyDocument(s.id, type, 'approved');
    this.toast.success(`Document (${type.toUpperCase()}) approved.`);

    // If all documents in this store are approved, auto-close drawer and toast success
    const updatedStore = this.storeService.getStoreById(s.id);
    if (updatedStore && updatedStore.status === 'active') {
      this.toast.success(`Store "${updatedStore.name}" is now fully activated!`);
      this.closeReviewDrawer();
    }
  }

  openRejectDocModal(type: DocumentType): void {
    this.rejectDocType.set(type);
    this.rejectionReason.set('');
    this.showRejectModal.set(true);
  }

  closeRejectDocModal(): void {
    this.showRejectModal.set(false);
    this.rejectDocType.set(null);
  }

  submitRejectDoc(): void {
    const s = this.selectedStore();
    const type = this.rejectDocType();
    const reason = this.rejectionReason().trim();

    if (!s || !type) return;
    if (!reason) {
      this.toast.error('Rejection reason is required.');
      return;
    }

    this.storeService.verifyDocument(s.id, type, 'rejected', reason);
    this.toast.warning(`Document (${type.toUpperCase()}) rejected.`);
    this.closeRejectDocModal();

    // Auto-close review drawer since the store status turns to 'rejected'
    this.closeReviewDrawer();
  }

  approveAllDocs(store: Store): void {
    this.storeService.updateStoreStatus(store.id, 'active');
    this.toast.success(`All documents approved. Store "${store.name}" activated!`);
  }
}
