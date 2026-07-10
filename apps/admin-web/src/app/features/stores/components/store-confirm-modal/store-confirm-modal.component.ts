import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-store-confirm-modal',
  standalone: true,
  template: `
    <div class="p-4 text-center">
      <div 
        class="mb-3 mx-auto d-flex align-items-center justify-content-center" 
        [style.background-color]="isDanger() ? 'rgba(192, 57, 43, 0.1)' : 'rgba(45, 122, 79, 0.1)'"
        [style.color]="isDanger() ? 'var(--brand-error)' : 'var(--brand-green)'"
        style="width: 64px; height: 64px; border-radius: 50%; font-size: 2rem;"
      >
        <i class="bi" [class]="isDanger() ? 'bi-exclamation-triangle-fill' : 'bi-question-circle-fill'"></i>
      </div>
      <h5 class="fw-bold text-dark mb-2">{{ title() }}</h5>
      <p class="text-muted mb-4 fs-7" [innerHTML]="message()"></p>
      <div class="d-flex justify-content-center gap-3">
        <button type="button" class="btn btn-light px-4 py-2 font-weight-bold border" (click)="activeModal.dismiss(false)">{{ cancelText() }}</button>
        <button type="button" class="btn px-4 py-2 font-weight-bold" [class]="isDanger() ? 'btn-danger' : 'btn-success'" (click)="activeModal.close(true)">
          {{ confirmText() }}
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreConfirmModalComponent {
  readonly activeModal = inject(NgbActiveModal);
  readonly title = signal<string>('Confirm Action');
  readonly message = signal<string>('Are you sure you want to perform this action?');
  readonly confirmText = signal<string>('Confirm');
  readonly cancelText = signal<string>('Cancel');
  readonly isDanger = signal<boolean>(false);
}
