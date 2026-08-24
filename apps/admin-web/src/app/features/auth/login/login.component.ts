import { Component, signal, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { AdminAuthState } from '../../../core/state/auth.state';
import { AdminLogin, ClearAdminAuthError } from '../../../core/state/auth.actions';
import { EMAIL_PATTERN } from '../../../core/validators/email.validator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly sub = new Subscription();

  readonly loading = signal(false);
  readonly passwordVisible = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: ['', [Validators.required]],
    remember: [false],
  });

  ngOnInit(): void {
    const currentUser = this.store.selectSignal(AdminAuthState.user)();
    if (currentUser) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.sub.add(
      this.store.select(AdminAuthState.error).subscribe((err: any) => {
        this.errorMsg.set(err);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.store.dispatch(new ClearAdminAuthError());
  }

  onLogin(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { email, password, remember } = this.form.value;

    this.store.dispatch(new AdminLogin(email!, password!, !!remember)).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  togglePassword(): void {
    this.passwordVisible.update((v) => !v);
  }
}
