import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionSupportService } from '../../../core/services/subscription-support.service';
import { AuditLog } from '../../../core/models/subscription-support.model';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-4" style="max-width: 1200px;">
      <!-- Header -->
      <div class="mb-4">
        <h4 class="fw-bold mb-1">Administrative Audit Logs</h4>
        <p class="text-muted mb-0">Track platform modifications, document approvals, and critical billing updates executed by admin operators</p>
      </div>

      <!-- Filter Controls -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-3">
          <div class="row g-3">
            
            <!-- Search -->
            <div class="col-lg-7 col-md-6">
              <div class="input-group">
                <span class="input-group-text bg-transparent border-end-0 text-muted">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0 ps-0"
                  placeholder="Search operator name, action details, IP..."
                  [ngModel]="searchQuery()"
                  (ngModelChange)="searchQuery.set($event)"
                />
              </div>
            </div>

            <!-- Module Filter -->
            <div class="col-lg-5 col-md-6">
              <select
                class="form-select"
                [ngModel]="moduleFilter()"
                (ngModelChange)="moduleFilter.set($event)"
              >
                <option value="all">All Modules</option>
                <option value="Auth">Auth</option>
                <option value="Stores">Stores & Verification</option>
                <option value="Users">Users & Contractors</option>
                <option value="Catalog">Catalog Management</option>
                <option value="Billing">Billing & Plans</option>
                <option value="Support">Support Helpdesk</option>
                <option value="Notifications">Notifications Broadcasts</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="card border-0 shadow-sm overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="table-light text-uppercase fs-8-5 fw-semibold text-muted">
              <tr>
                <th scope="col" class="ps-4">Timestamp</th>
                <th scope="col">Admin User / Role</th>
                <th scope="col">Platform Module</th>
                <th scope="col">Action Details</th>
                <th scope="col" class="text-end pe-4">IP Address</th>
              </tr>
            </thead>
            <tbody>
              @for (log of filteredLogs(); track log.id) {
                <tr>
                  <td class="ps-4 py-2.5 font-monospace text-muted fs-8">
                    {{ log.timestamp | date:'yyyy-MM-dd HH:mm:ss' }}
                  </td>
                  <td>
                    <div class="fs-7-5 text-dark fw-bold">{{ log.operatorName }}</div>
                    <span class="fs-8 text-muted text-uppercase fw-semibold">{{ log.role }}</span>
                  </td>
                  <td>
                    <span [class]="'badge text-uppercase fs-8 px-2 py-1 module-badge module-badge--' + log.module.toLowerCase()">
                      {{ log.module }}
                    </span>
                  </td>
                  <td class="fs-7-5 text-secondary" style="max-width: 480px;">
                    {{ log.action }}
                  </td>
                  <td class="text-end pe-4 font-monospace text-muted fs-8">
                    {{ log.ip }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-journal-text fs-2 d-block mb-3 opacity-30"></i>
                    <p class="mb-0 fw-medium">No administrative log trails found matching filters</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fs-8 {
      font-size: 0.72rem;
    }

    // Module badge configurations
    .module-badge {
      font-weight: 700;
      border-radius: 4px;

      &.module-badge--auth {
        background-color: #ebedef;
        color: #5d6d7e;
      }
      &.module-badge--stores {
        background-color: rgba(45, 122, 79, 0.1);
        color: var(--brand-green);
      }
      &.module-badge--users {
        background-color: rgba(0, 123, 255, 0.1);
        color: #007bff;
      }
      &.module-badge--catalog {
        background-color: rgba(23, 162, 184, 0.1);
        color: #17a2b8;
      }
      &.module-badge--billing {
        background-color: #fef5e7;
        color: #a04000;
      }
      &.module-badge--support {
        background-color: #fce4d6;
        color: #c55a11;
      }
      &.module-badge--notifications {
        background-color: #f3e5f5;
        color: #8e24aa;
      }
    }

    .custom-table {
      tr {
        transition: background-color 0.15s ease;
      }
      tbody tr:hover {
        background-color: #fcfdfa;
      }
    }
  `]
})
export class AuditLogsComponent {
  private readonly subSupportService = inject(SubscriptionSupportService);

  readonly searchQuery = signal('');
  readonly moduleFilter = signal('all');

  readonly allLogs = this.subSupportService.auditLogs;

  readonly filteredLogs = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.moduleFilter();

    return this.allLogs().filter(log => {
      const matchesSearch = !query ||
        log.operatorName.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.ip.includes(query);

      const matchesModule = filter === 'all' || log.module === filter;

      return matchesSearch && matchesModule;
    });
  });
}
