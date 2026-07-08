import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row g-3">
      @for (action of actions; track action.route) {
        <div class="col-lg-3 col-md-6 col-12">
          <a [routerLink]="action.route" class="quick-action-card">
            <div class="qa-icon" [style.background]="action.bg" [style.color]="action.color">
              <i class="bi" [class]="action.icon"></i>
            </div>
            <div class="qa-info">
              <span class="qa-label">{{ action.label }}</span>
              <small class="qa-desc text-muted">{{ action.description }}</small>
            </div>
            <i class="bi bi-chevron-right qa-arrow"></i>
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .quick-action-card {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 1rem 1.125rem;
      background: #fff;
      border: 1px solid var(--brand-border);
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        transform: translateY(-1px);
        border-color: var(--brand-green);
      }
    }

    .qa-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 1.15rem;
    }

    .qa-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .qa-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--brand-text-dark);
    }

    .qa-desc {
      font-size: 0.72rem;
      line-height: 1.3;
    }

    .qa-arrow {
      color: var(--brand-text-light);
      font-size: 0.8rem;
      flex-shrink: 0;
    }
  `],
})
export class QuickActionsComponent {
  readonly actions = [
    {
      label: 'Create Store',
      description: 'Register a new vendor',
      icon: 'bi-plus-circle',
      route: '/stores/create',
      bg: 'rgba(45, 122, 79, 0.1)',
      color: '#2d7a4f',
    },
    {
      label: 'Review Documents',
      description: 'Pending verifications',
      icon: 'bi-shield-check',
      route: '/stores/verification',
      bg: 'rgba(217, 146, 1, 0.1)',
      color: '#d99201',
    },
    {
      label: 'Support Tickets',
      description: 'Open tickets queue',
      icon: 'bi-ticket',
      route: '/support/tickets',
      bg: 'rgba(41, 128, 185, 0.1)',
      color: '#2980b9',
    },
  ];
}
