import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (toastService.hasToasts()) {
      <div class="toast-container">
        @for (toast of toastService.toasts(); track toast.id) {
          <div
            class="toast-item"
            [class]="'toast-item toast--' + toast.type"
            (click)="toastService.dismiss(toast.id)"
          >
            <i class="bi" [class]="iconMap[toast.type]"></i>
            <span>{{ toast.message }}</span>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 400px;
    }

    .toast-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      animation: slideIn 0.25s ease;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .toast--success {
      background: #eafaf1;
      color: #1a5c35;
      border-left: 4px solid #2d7a4f;
    }

    .toast--error {
      background: #fdecea;
      color: #8e2b1f;
      border-left: 4px solid #c0392b;
    }

    .toast--warning {
      background: #fef9e7;
      color: #7d6608;
      border-left: 4px solid #d99201;
    }

    .toast--info {
      background: #eaf2f8;
      color: #1a5276;
      border-left: 4px solid #2980b9;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `],
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  readonly iconMap: Record<string, string> = {
    success: 'bi-check-circle-fill',
    error: 'bi-exclamation-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill',
  };
}
