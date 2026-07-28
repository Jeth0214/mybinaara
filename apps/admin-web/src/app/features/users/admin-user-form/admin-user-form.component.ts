import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, untracked, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { StaffService } from '../../../core/services/staff.service';
import { ToastService } from '../../../core/services/toast.service';
import { CreateStaffPayload, StaffMember, StaffRole, UpdateStaffPayload } from '../../../core/models/staff.model';
import { AdminAuthState } from '../../../core/state/auth.state';
import { SAUDI_PHONE_PATTERN } from '../../../core/validators/phone.validator';

@Component({
  selector: 'app-admin-user-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-user-form.component.html',
  styleUrl: './admin-user-form.component.scss'
})
export class AdminUserFormComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly staffService = inject(StaffService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private sub = new Subscription();

  readonly adminId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.adminId());

  readonly currentUser = this.store.selectSignal(AdminAuthState.user);
  readonly isSelf = computed(() => {
    const id = this.adminId();
    return !!id && id === String(this.currentUser()?.id ?? '');
  });

  readonly loadedStaff = signal<StaffMember | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly submitAttempted = signal(false);
  readonly busy = computed(() => this.loading() || this.submitting());

  readonly selectedPermissions = signal<Set<string>>(new Set());

  readonly permissionGroups = this.staffService.permissionGroups;
  readonly permissionsLoading = this.staffService.permissionsLoading;
  readonly permissionsError = this.staffService.permissionsError;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.maxLength(13), Validators.pattern(SAUDI_PHONE_PATTERN)]],
    whatsapp: ['', [Validators.required, Validators.maxLength(13), Validators.pattern(SAUDI_PHONE_PATTERN)]],
    roleTier: ['staff' as StaffRole, [Validators.required]],
  });

  constructor() {
    // Lock every control while fetching or submitting; restore the self-edit
    // role-tier lock afterward instead of blindly re-enabling everything.
    effect(() => {
      const isBusy = this.busy();
      untracked(() => {
        if (isBusy) {
          this.form.disable({ emitEvent: false });
        } else {
          this.form.enable({ emitEvent: false });
          if (this.isSelf()) {
            this.form.get('roleTier')?.disable({ emitEvent: false });
          }
        }
      });
    });

    // Patch the form once the fetched staff member becomes available
    effect(() => {
      const staff = this.loadedStaff();
      if (staff) {
        untracked(() => {
          this.form.patchValue({
            name: staff.name,
            email: staff.email,
            phone: staff.phone,
            whatsapp: staff.whatsapp ?? '',
            roleTier: staff.role,
          });
          this.selectedPermissions.set(new Set(staff.role === 'staff' ? staff.permissions : []));

          if (staff.role === 'staff') {
            this.staffService.loadPermissionGroups();
          }

          // Prevent accidentally locking yourself out by changing your own role
          if (this.isSelf()) {
            this.form.get('roleTier')?.disable({ emitEvent: false });
          } else {
            this.form.get('roleTier')?.enable({ emitEvent: false });
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.sub.add(
      this.route.params.subscribe(params => {
        const id = params['id'] || null;
        this.adminId.set(id);
        if (id) {
          this.fetchStaff(+id);
        } else {
          // Create mode defaults to "Staff" — load the checklist up front.
          this.staffService.loadPermissionGroups();
        }
      })
    );

    this.sub.add(
      this.form.get('roleTier')?.valueChanges.subscribe((tier) => {
        if (tier === 'staff') {
          this.staffService.loadPermissionGroups();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  togglePermission(key: string): void {
    this.selectedPermissions.update((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  isPermissionSelected(key: string): boolean {
    return this.selectedPermissions().has(key);
  }

  /** Re-checked fresh on every read (not a computed) so a role-tier switch alone updates it. */
  permissionsInvalid(): boolean {
    return this.form.controls.roleTier.value === 'staff' && this.selectedPermissions().size === 0;
  }

  retryLoadPermissions(): void {
    this.staffService.loadPermissionGroups();
  }

  submit(): void {
    this.submitAttempted.set(true);

    if (this.form.invalid || this.permissionsInvalid()) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, phone, whatsapp, roleTier } = this.form.getRawValue();
    const base = {
      name: name!,
      email: email!,
      phone: phone!,
      whatsapp: whatsapp!,
    };

    const id = this.adminId();
    this.submitting.set(true);

    const request$ = id
      ? this.staffService.updateStaff(+id, this.buildPayload(base, roleTier as StaffRole) as UpdateStaffPayload)
      : this.staffService.createStaff(this.buildPayload(base, roleTier as StaffRole) as CreateStaffPayload);

    request$.subscribe({
      next: (staff) => {
        this.submitting.set(false);
        this.toast.success(`User "${staff.name}" ${id ? 'updated' : 'created'} successfully.`);
        this.router.navigate(id ? ['/users/admins', id] : ['/users/admins']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(err?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }

  private buildPayload(
    base: { name: string; email: string; phone: string; whatsapp?: string },
    roleTier: StaffRole
  ) {
    return roleTier === 'administrator'
      ? { ...base, role: 'administrator' as const }
      : { ...base, permissions: [...this.selectedPermissions()] };
  }

  fetchStaff(id: number): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.staffService.getStaff(id).subscribe({
      next: (staff) => {
        this.loading.set(false);
        this.loadedStaff.set(staff);
      },
      error: (err) => {
        this.loading.set(false);
        this.loadError.set(err?.message ?? 'Failed to load this user.');
      },
    });
  }
}
