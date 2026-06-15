import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SubscriptionSupportService } from '../../../core/services/subscription-support.service';
import { ToastService } from '../../../core/services/toast.service';
import { SystemNotification } from '../../../core/models/subscription-support.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-4" style="max-width: 1100px;">
      <!-- Header -->
      <div class="mb-4">
        <h4 class="fw-bold mb-1">Platform Broadcast Center</h4>
        <p class="text-muted mb-0">Push system announcements, maintenance alerts, or rules updates to target customer and store cohorts</p>
      </div>

      <div class="row g-4">
        
        <!-- Left: Past Notifications Feed (7/12) -->
        <div class="col-lg-7 col-md-12">
          <div class="card border-0 shadow-sm p-4">
            <h6 class="fw-bold text-dark border-bottom pb-2 mb-3">Broadcast History</h6>
            
            <div class="notifications-feed">
              @for (notif of notifications(); track notif.id) {
                <div [class]="'alert alert--' + notif.type + ' border p-3.5 mb-3 rounded-3 shadow-xs position-relative overflow-hidden'">
                  <!-- Sidebar accent indicator -->
                  <div class="accent-bar"></div>

                  <div class="d-flex justify-content-between align-items-start mb-2 ms-1.5">
                    <div>
                      <h6 class="fw-bold text-dark mb-0.5">{{ notif.title }}</h6>
                      <span class="fs-8 text-muted">Sent {{ notif.createdAt | date:'short' }}</span>
                    </div>
                    <span class="badge text-uppercase fs-8-5 px-2 py-1 target-badge">
                      To: {{ notif.targetGroup }}
                    </span>
                  </div>

                  <p class="mb-0 text-secondary fs-7-5 lh-lg ms-1.5">{{ notif.content }}</p>
                </div>
              } @empty {
                <div class="text-center py-5 text-muted">
                  <i class="bi bi-bell-slash fs-1 d-block mb-3 opacity-30"></i>
                  <h5>No notifications broadcasted yet</h5>
                  <p class="mb-0 fs-8">Use the panel on the right to dispatch alerts.</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right: Dispatch Form Panel (5/12) -->
        <div class="col-lg-5 col-md-12">
          <div class="card border-0 shadow-sm p-4 sticky-top" style="top: 20px;">
            <h6 class="fw-bold text-dark border-bottom pb-2 mb-3">New System Broadcast</h6>
            
            <form [formGroup]="broadcastForm" (ngSubmit)="submitBroadcast()">
              <div class="mb-3">
                <label class="form-label fw-semibold fs-8 text-uppercase text-muted">Alert Title</label>
                <input
                  type="text"
                  class="form-control fs-7-5"
                  placeholder="e.g. System Update Completed"
                  formControlName="title"
                />
                @if (broadcastForm.get('title')?.touched && broadcastForm.get('title')?.invalid) {
                  <div class="text-danger fs-8 mt-1">Title is required (min 5 characters).</div>
                }
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold fs-8 text-uppercase text-muted">Broadcast Content Message</label>
                <textarea
                  class="form-control fs-7-5"
                  rows="4"
                  placeholder="State details of the 플랫폼 wide announcement..."
                  formControlName="content"
                ></textarea>
                @if (broadcastForm.get('content')?.touched && broadcastForm.get('content')?.invalid) {
                  <div class="text-danger fs-8 mt-1">Content description is required (min 10 characters).</div>
                }
              </div>

              <div class="row g-2 mb-4">
                <div class="col-md-6">
                  <label class="form-label fw-semibold fs-8 text-uppercase text-muted">Alert Level</label>
                  <select class="form-select fs-7-5" formControlName="type">
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Gold)</option>
                    <option value="success">Success (Green)</option>
                    <option value="danger">Critical (Red)</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold fs-8 text-uppercase text-muted">Target Group</label>
                  <select class="form-select fs-7-5" formControlName="targetGroup">
                    <option value="all">All Users</option>
                    <option value="stores">Merchant Stores Only</option>
                    <option value="customers">Customers (Consumers)</option>
                    <option value="contractors">Contractors Only</option>
                  </select>
                </div>
              </div>

              <button type="submit" class="btn btn-success w-100 py-2 fs-7-5 fw-semibold d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-broadcast"></i> Push System Notification
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .fs-8 {
      font-size: 0.72rem;
    }

    .notifications-feed {
      max-height: 520px;
      overflow-y: auto;
    }

    // Custom Alert Styling with side accent bars
    .alert {
      position: relative;
      background-color: #ffffff;
      border-color: var(--brand-border);
      
      .accent-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
      }

      &.alert--info {
        background-color: #eaf2f8;
        border-color: #d4e6f1;
        .accent-bar { background-color: #2980b9; }
      }
      &.alert--warning {
        background-color: #fef9e7;
        border-color: #fcf3cf;
        .accent-bar { background-color: #d99201; }
      }
      &.alert--success {
        background-color: #eafaf1;
        border-color: #d4efdf;
        .accent-bar { background-color: #2d7a4f; }
      }
      &.alert--danger {
        background-color: #fdecea;
        border-color: #fadbd8;
        .accent-bar { background-color: #c0392b; }
      }
    }

    .target-badge {
      background-color: #f2f3f4;
      color: #5d6d7e;
      font-weight: 700;
    }
  `]
})
export class NotificationsComponent {
  private readonly subSupportService = inject(SubscriptionSupportService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly notifications = this.subSupportService.notifications;

  readonly broadcastForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
    type: ['info', Validators.required],
    targetGroup: ['all', Validators.required]
  });

  submitBroadcast(): void {
    if (this.broadcastForm.invalid) {
      this.broadcastForm.markAllAsTouched();
      return;
    }

    const { title, content, type, targetGroup } = this.broadcastForm.value;
    
    // Broadcast notification
    this.subSupportService.broadcastNotification(title!, content!, type as SystemNotification['type'], targetGroup as SystemNotification['targetGroup']);
    
    // Also push an administrative audit log record for security audit trail!
    this.subSupportService.addAuditLog(
      'Super Admin User', 
      'super admin', 
      `Broadcasted notification alert: "${title}" to group: ${targetGroup?.toUpperCase()}`,
      'Notifications'
    );

    this.toast.success(`Platform announcement "${title}" pushed to all targets.`);
    this.broadcastForm.reset({ title: '', content: '', type: 'info', targetGroup: 'all' });
  }
}
