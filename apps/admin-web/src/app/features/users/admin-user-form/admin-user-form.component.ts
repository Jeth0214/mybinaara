import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, untracked, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { UserCatalogService } from '../../../core/services/user-catalog.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminRole } from '../../../core/models/user.model';
import { AdminAuthState } from '../../../core/state/auth.state';

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
  private readonly userCatalogService = inject(UserCatalogService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private sub = new Subscription();

  readonly adminId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.adminId());

  readonly currentUser = this.store.selectSignal(AdminAuthState.user);
  readonly isSelf = computed(() => {
    const id = this.adminId();
    return !!id && id === this.currentUser()?.id;
  });

  readonly admin = computed(() => {
    const id = this.adminId();
    return id ? this.userCatalogService.admins().find(a => a.id === id) : null;
  });

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    role: ['user' as AdminRole, [Validators.required]],
  });

  constructor() {
    // Patch the form once the resolved admin becomes available
    effect(() => {
      const a = this.admin();
      if (a) {
        untracked(() => {
          this.form.patchValue({
            name: a.name,
            email: a.email,
            phone: a.phone || '',
            role: a.role,
          });

          // Prevent accidentally locking yourself out by changing your own role
          if (this.isSelf()) {
            this.form.get('role')?.disable({ emitEvent: false });
          } else {
            this.form.get('role')?.enable({ emitEvent: false });
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.sub.add(
      this.route.params.subscribe(params => {
        this.adminId.set(params['id'] || null);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, phone, role } = this.form.getRawValue();
    const id = this.adminId();

    if (id) {
      this.userCatalogService.updateAdminUser(id, {
        name: name!,
        email: email!,
        phone: phone || undefined,
        role: role as AdminRole
      });
      this.toast.success(`User "${name}" updated successfully.`);
      this.router.navigate(['/users/admins', id]);
    } else {
      this.userCatalogService.addAdminUser(name!, email!, phone || '', role as AdminRole);
      this.toast.success(`User "${name}" created successfully.`);
      this.router.navigate(['/users/admins']);
    }
  }
}
