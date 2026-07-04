import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionSupportService } from '../../../core/services/subscription-support.service';
import { ToastService } from '../../../core/services/toast.service';
import { SupportTicket } from '../../../core/models/subscription-support.model';

@Component({
  selector: 'app-ticket-queue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-4" style="max-width: 1200px;">
      <!-- Header -->
      <div class="mb-4">
        <h4 class="fw-bold mb-1">Support Ticket Resolver</h4>
        <p class="text-muted mb-0">Review helpdesk requests, logistics complaints, and dispatch operator assistance replies</p>
      </div>

      <!-- Filters & Main Split layout -->
      <div class="row g-4">
        
        <!-- Left Column: Tickets list (5/12) -->
        <div class="col-lg-5 col-md-12">
          <div class="card border-0 shadow-sm overflow-hidden mb-4">
            <div class="card-header bg-white border-bottom-0 py-3 d-flex justify-content-between align-items-center">
              <h6 class="mb-0 fw-bold">Incoming Queue</h6>
              <select
                class="form-select form-select-sm fw-semibold"
                style="width: 150px;"
                [ngModel]="statusFilter()"
                (ngModelChange)="statusFilter.set($event)"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div class="list-group list-group-flush border-top">
              @for (ticket of filteredTickets(); track ticket.id) {
                <button
                  class="list-group-item list-group-item-action text-start p-3 border-0 border-bottom d-flex align-items-start gap-2.5"
                  [class.active-item]="selectedTicketId() === ticket.id"
                  (click)="selectedTicketId.set(ticket.id)"
                >
                  <div class="flex-grow-1 min-w-0">
                    <div class="d-flex justify-content-between align-items-start gap-2">
                      <h6 class="mb-0 fw-bold fs-7-5 text-truncate" [class.text-success]="selectedTicketId() === ticket.id">
                        {{ ticket.subject }}
                      </h6>
                      <span [class]="'badge text-uppercase fs-8-5 px-2 py-0.5 priority-badge priority-badge--' + ticket.priority">
                        {{ ticket.priority }}
                      </span>
                    </div>
                    <span class="fs-8 text-muted d-block mt-0.5">By: {{ ticket.userName }} ({{ ticket.userType }})</span>
                    <p class="fs-8 text-secondary text-truncate mt-1.5 mb-0">{{ ticket.message }}</p>
                  </div>
                </button>
              } @empty {
                <div class="text-center py-5 text-muted">
                  <i class="bi bi-ticket-perforated fs-2 d-block mb-2 opacity-30 text-success"></i>
                  <p class="mb-0 fw-semibold">No tickets in this status</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right Column: Detail message & Reply console (7/12) -->
        <div class="col-lg-7 col-md-12">
          @if (selectedTicket(); as t) {
            <div class="card border-0 shadow-sm p-4 sticky-top" style="top: 20px;">
              
              <!-- Ticket Meta header -->
              <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
                <div>
                  <h5 class="fw-bold mb-1">{{ t.subject }}</h5>
                  <span class="fs-8 text-muted font-monospace">TICKET ID: {{ t.id }} • Submitted {{ t.createdAt | date:'short' }}</span>
                </div>
                <div class="d-flex gap-1.5">
                  <span [class]="'badge text-uppercase fs-8-5 px-2.5 py-1.5 priority-badge priority-badge--' + t.priority">
                    {{ t.priority }}
                  </span>
                  <span [class]="'status-badge status-badge--' + (t.status === 'resolved' ? 'active' : 'pending')">
                    {{ t.status }}
                  </span>
                </div>
              </div>

              <!-- Contact detail block -->
              <div class="bg-light p-2.5 rounded-3 mb-4 fs-7-5 d-flex justify-content-between">
                <div><strong>Sender:</strong> {{ t.userName }} ({{ t.userType | uppercase }})</div>
                <div class="font-monospace text-muted">{{ t.email }}</div>
              </div>

              <!-- Message body -->
              <div class="mb-4">
                <label class="form-label fs-8 text-muted fw-semibold text-uppercase">Inquiry Message</label>
                <div class="p-3 bg-white border rounded-3 text-dark fs-7-5 lh-lg shadow-sm">
                  {{ t.message }}
                </div>
              </div>

              <!-- Reply feed -->
              @if (t.replies.length > 0) {
                <div class="mb-4 border-top pt-3">
                  <label class="form-label fs-8 text-muted fw-semibold text-uppercase">Replies history</label>
                  @for (reply of t.replies; track reply) {
                    <div class="p-3 bg-success bg-opacity-5 border border-success border-opacity-10 rounded-3 text-dark fs-7-5 lh-lg mb-2 shadow-sm">
                      <div class="d-flex justify-content-between fs-8-5 text-success mb-1 fw-bold">
                        <span>MYBINAARA HELPDESK</span>
                        <span class="fw-normal font-monospace text-muted">Operator Dispatched</span>
                      </div>
                      {{ reply }}
                    </div>
                  }
                </div>
              }

              <!-- Action Reply Box -->
              @if (t.status === 'open') {
                <div class="border-top pt-3">
                  <label class="form-label fs-8 text-muted fw-semibold text-uppercase mb-1.5">Send Operator Reply</label>
                  <textarea
                    class="form-control fs-7-5 mb-3"
                    rows="3"
                    [(ngModel)]="replyText"
                  ></textarea>

                  <button
                    class="btn btn-success d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold fs-7-5 px-4"
                    (click)="submitReply(t)"
                  >
                    <i class="bi bi-reply-fill fs-5"></i> Submit Reply & Resolve Ticket
                  </button>
                </div>
              } @else {
                <div class="alert alert-success fs-7-5 mb-0 text-center">
                  <i class="bi bi-check-circle-fill"></i> This support ticket is resolved and closed.
                </div>
              }

            </div>
          } @else {
            <div class="card border-0 shadow-sm p-5 text-center text-muted">
              <i class="bi bi-ticket-perforated fs-1 d-block mb-3 opacity-30"></i>
              <h5>Select a ticket to view conversation</h5>
              <p class="mb-0">Choose a helpdesk ticket on the left list to review detailed logs, send messages, or check status.</p>
            </div>
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    .fs-8 {
      font-size: 0.72rem;
    }

    .list-group-item {
      cursor: pointer;
      transition: background-color 0.15s;

      &:hover {
        background-color: var(--brand-surface) !important;
      }
    }

    .active-item {
      background-color: rgba(45, 122, 79, 0.04) !important;
      border-left: 3px solid var(--brand-green) !important;
    }

    // Priority badges
    .priority-badge {
      font-weight: 700;
      border-radius: 4px;

      &.priority-badge--critical {
        background-color: #fdecea;
        color: #8e2b1f;
      }
      &.priority-badge--high {
        background-color: #fef5e7;
        color: #a04000;
      }
      &.priority-badge--medium {
        background-color: #eaf2f8;
        color: #1a5276;
      }
      &.priority-badge--low {
        background-color: #f2f3f4;
        color: #5d6d7e;
      }
    }
  `]
})
export class TicketQueueComponent {
  private readonly subSupportService = inject(SubscriptionSupportService);
  private readonly toast = inject(ToastService);

  readonly statusFilter = signal('open');
  readonly selectedTicketId = signal<string | null>(null);
  readonly replyText = signal('');

  readonly allTickets = this.subSupportService.tickets;

  readonly selectedTicket = computed(() => {
    const id = this.selectedTicketId();
    return id ? this.allTickets().find(t => t.id === id) : null;
  });

  readonly filteredTickets = computed(() => {
    const filter = this.statusFilter();
    return this.allTickets().filter(t => filter === 'all' || t.status === filter);
  });

  submitReply(ticket: SupportTicket): void {
    const reply = this.replyText().trim();
    if (!reply) {
      this.toast.error('Reply text cannot be blank.');
      return;
    }

    this.subSupportService.replyToTicket(ticket.id, reply);
    this.toast.success(`Reply sent. Ticket #${ticket.id} marked as RESOLVED.`);
    this.replyText.set('');
  }
}
