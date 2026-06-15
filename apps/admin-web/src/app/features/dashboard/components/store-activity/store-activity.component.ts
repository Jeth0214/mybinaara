import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StoreActivityItem } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-store-activity',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card h-100">
      <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-semibold">Store Activity</h6>
      </div>
      <div class="card-body p-0">
        <div class="activity-list">
          @for (item of activities(); track item.id) {
            <div class="activity-item">
              <div class="activity-icon" [class]="'activity-icon activity-icon--' + item.type">
                <i class="bi" [class]="item.icon"></i>
              </div>
              <div class="activity-content">
                <p class="activity-text mb-0">
                  <strong>{{ item.storeName }}</strong>
                </p>
                <p class="activity-action mb-0">{{ item.action }}</p>
                <small class="activity-time text-muted">{{ getRelativeTime(item.timestamp) }}</small>
              </div>
            </div>
          } @empty {
            <div class="text-center py-4 text-muted">
              <i class="bi bi-clock-history fs-4 d-block mb-2 opacity-50"></i>
              <p class="mb-0">No recent activity</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .activity-list {
      max-height: 420px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid var(--brand-border);
      transition: background 0.12s;

      &:hover {
        background: var(--brand-surface);
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .activity-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.9rem;

      &.activity-icon--registration {
        background: rgba(45, 122, 79, 0.1);
        color: var(--brand-green);
      }
      &.activity-icon--activation {
        background: rgba(217, 146, 1, 0.1);
        color: var(--brand-gold);
      }
      &.activity-icon--suspension {
        background: rgba(192, 57, 43, 0.1);
        color: var(--brand-error);
      }
      &.activity-icon--verification {
        background: rgba(41, 128, 185, 0.1);
        color: var(--brand-info);
      }
    }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-text {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--brand-text-dark);
      line-height: 1.3;
    }

    .activity-action {
      font-size: 0.8rem;
      color: var(--brand-text-mid);
    }

    .activity-time {
      font-size: 0.72rem;
    }
  `],
})
export class StoreActivityComponent {
  readonly activities = input<StoreActivityItem[]>([]);

  getRelativeTime(timestamp: string): string {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}
