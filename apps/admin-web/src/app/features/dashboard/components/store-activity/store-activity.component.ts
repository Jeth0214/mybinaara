import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StoreActivityItem } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-store-activity',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-activity.component.html',
  styleUrl: './store-activity.component.scss',
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
