import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecentStore } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-recent-stores',
  standalone: true,
  imports: [DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="data-table-wrapper">
      <div class="data-table-header">
        <div>
          <span class="data-table-title">Recent Stores</span>
          <span class="data-table-count ms-2">({{ stores().length }})</span>
        </div>
        <a routerLink="/stores" class="btn btn-sm btn-outline-success">View all</a>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Store</th>
            <th>City</th>
            <th>Category</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          @for (store of stores(); track store.id) {
            <tr>
              <td>
                <div class="d-flex flex-column">
                  <span class="fw-semibold">{{ store.businessName }}</span>
                  <small class="text-muted">{{ store.ownerName }}</small>
                </div>
              </td>
              <td>{{ store.city }}</td>
              <td><small>{{ store.category }}</small></td>
              <td>
                <span class="status-badge" [class]="'status-badge status--' + store.status">
                  {{ store.status }}
                </span>
              </td>
              <td><small class="text-muted">{{ store.createdAt | date:'mediumDate' }}</small></td>
            </tr>
          } @empty {
            <tr>
              <td colspan="5" class="data-table-empty">
                <i class="bi bi-shop"></i>
                <p>No stores registered yet</p>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class RecentStoresComponent {
  readonly stores = input<RecentStore[]>([]);
}
