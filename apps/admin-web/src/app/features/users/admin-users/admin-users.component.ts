import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserCatalogService } from '../../../core/services/user-catalog.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminUser, AdminRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-4" style="max-width: 1100px;">
      <!-- Header -->
      <div class="mb-4">
        <h4 class="fw-bold mb-1">Admin Sub-Users & Permissions</h4>
        <p class="text-muted mb-0">Create, edit, and manage internal operator accounts with role-based restrictions</p>
      </div>

      <div class="row g-4">
        <!-- Left: Listing Table (8/12) -->
        <div class="col-lg-8 col-md-12">
          <div class="card border-0 shadow-sm overflow-hidden">
            <div class="card-header bg-white border-bottom-0 py-3">
              <h6 class="mb-0 fw-bold">Active Operators</h6>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0 custom-table">
                <thead class="table-light text-uppercase fs-8 fw-semibold text-muted">
                  <tr>
                    <th scope="col" class="ps-4">Admin Details</th>
                    <th scope="col">Assigned Role</th>
                    <th scope="col">Status</th>
                    <th scope="col" class="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (admin of admins(); track admin.id) {
                    <tr>
                      <td class="ps-4 py-3">
                        <div class="d-flex align-items-center gap-2.5">
                          <div class="avatar-letter bg-dark text-white fw-bold">
                            {{ admin.name.charAt(0) }}
                          </div>
                          <div>
                            <h6 class="mb-0 fw-semibold fs-7-5">{{ admin.name }}</h6>
                            <span class="fs-8 text-muted font-monospace d-block">{{ admin.email }}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span [class]="'badge text-uppercase fs-8-5 px-2.5 py-1.5 role-badge role-badge--' + admin.role.replace(' ', '-')">
                          {{ admin.role }}
                        </span>
                      </td>
                      <td>
                        <span [class]="'status-badge status-badge--' + admin.status">
                          {{ admin.status }}
                        </span>
                      </td>
                      <td class="text-end pe-4">
                        @if (admin.role !== 'super admin') {
                          <button
                            class="btn btn-icon-btn btn-sm"
                            (click)="toggleStatus(admin)"
                            [title]="admin.status === 'active' ? 'Suspend Operator' : 'Reactivate Operator'"
                          >
                            @if (admin.status === 'active') {
                              <i class="bi bi-slash-circle text-danger"></i>
                            } @else {
                              <i class="bi bi-check-circle text-success"></i>
                            }
                          </button>
                        } @else {
                          <span class="text-muted fs-8 pe-2">Locked</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Create Form (4/12) -->
        <div class="col-lg-4 col-md-12">
          <div class="card border-0 shadow-sm p-4 sticky-top" style="top: 20px;">
            <h6 class="fw-bold text-dark border-bottom pb-2 mb-3">Add Operator User</h6>
            
            <form [formGroup]="adminForm" (ngSubmit)="submitForm()">
              <div class="mb-3">
                <label class="form-label fw-semibold fs-8 text-uppercase text-muted">Full Name</label>
                <input
                  type="text"
                  class="form-control fs-7-5"
                  formControlName="name"
                />
                @if (adminForm.get('name')?.touched && adminForm.get('name')?.invalid) {
                  <div class="text-danger fs-8 mt-1">Full name is required (min 3 chars).</div>
                }
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold fs-8 text-uppercase text-muted">Email Address</label>
                <input
                  type="email"
                  class="form-control fs-7-5"
                  formControlName="email"
                />
                @if (adminForm.get('email')?.touched && adminForm.get('email')?.invalid) {
                  <div class="text-danger fs-8 mt-1">Please enter a valid company email.</div>
                }
              </div>

              <div class="mb-4">
                <label class="form-label fw-semibold fs-8 text-uppercase text-muted">Assigned Role</label>
                <select class="form-select fs-7-5" formControlName="role">
                  <option value="">Select Role...</option>
                  <option value="support">Support Agent (Operations/Tickets)</option>
                  <option value="finance">Finance Controller (Subscriptions/Invoices)</option>
                  <option value="ops">Ops Specialist (Category/Product approvals)</option>
                </select>
                @if (adminForm.get('role')?.touched && adminForm.get('role')?.invalid) {
                  <div class="text-danger fs-8 mt-1">Please assign a structural permission role.</div>
                }
              </div>

              <button type="submit" class="btn btn-success w-100 py-2 fs-7-5 fw-semibold">
                Create & Dispatched Link
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
      letter-spacing: 0.02rem;
    }

    .avatar-letter {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
    }

    // Role Badges Colors
    .role-badge {
      font-weight: 700;
      border-radius: 4px;
      
      &.role-badge--super-admin {
        background-color: #fdecea;
        color: #8e2b1f;
      }
      &.role-badge--finance {
        background-color: #eaf2f8;
        color: #1a5276;
      }
      &.role-badge--ops {
        background-color: #fef9e7;
        color: #7d6608;
      }
      &.role-badge--support {
        background-color: #eafaf1;
        color: #1a5c35;
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
export class AdminUsersComponent {
  private readonly userCatalogService = inject(UserCatalogService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly admins = this.userCatalogService.admins;

  readonly adminForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['', Validators.required]
  });

  submitForm(): void {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }
    
    const { name, email, role } = this.adminForm.value;
    this.userCatalogService.addAdminUser(name!, email!, role as AdminRole);
    this.toast.success(`Admin user "${name}" successfully registered as ${role?.toUpperCase()}.`);
    this.adminForm.reset({ name: '', email: '', role: '' });
  }

  toggleStatus(admin: AdminUser): void {
    this.userCatalogService.toggleAdminStatus(admin.id);
    const updated = this.userCatalogService.admins().find(a => a.id === admin.id);
    
    if (updated?.status === 'active') {
      this.toast.success(`Operator account "${admin.name}" activated.`);
    } else {
      this.toast.warning(`Operator account "${admin.name}" suspended.`);
    }
  }
}
