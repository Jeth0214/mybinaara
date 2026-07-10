import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserCatalogService } from '../../../core/services/user-catalog.service';
import { ToastService } from '../../../core/services/toast.service';
import { StoreConfirmModalComponent } from '../../stores/components/store-confirm-modal/store-confirm-modal.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly userCatalogService = inject(UserCatalogService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private sub = new Subscription();

  readonly productId = signal<string | null>(null);
  readonly showSuspendModal = signal(false);
  readonly suspensionReason = signal('');

  readonly product = computed(() => {
    const id = this.productId();
    return id ? this.userCatalogService.products().find(p => p.id === id) : null;
  });

  ngOnInit(): void {
    this.sub.add(
      this.route.params.subscribe(params => {
        this.productId.set(params['id'] || null);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  openSuspendModal(): void {
    this.suspensionReason.set('');
    this.showSuspendModal.set(true);
  }

  closeSuspendModal(): void {
    this.showSuspendModal.set(false);
  }

  submitSuspend(): void {
    const prod = this.product();
    const reason = this.suspensionReason().trim();
    if (!prod || reason.length < 5) return;

    this.userCatalogService.suspendProduct(prod.id, reason);
    this.toast.warning(`"${prod.name}" has been suspended.`);
    this.closeSuspendModal();
  }

  unsuspendProduct(): void {
    const prod = this.product();
    if (!prod) return;

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set('Unsuspend Product');
    modalRef.componentInstance.message.set(
      `Are you sure you want to unsuspend <strong>${prod.name}</strong> and make it active again?`
    );
    modalRef.componentInstance.confirmText.set('Unsuspend');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(false);

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.userCatalogService.unsuspendProduct(prod.id);
          this.toast.success(`"${prod.name}" has been unsuspended.`);
        }
      },
      () => {}
    );
  }
}
