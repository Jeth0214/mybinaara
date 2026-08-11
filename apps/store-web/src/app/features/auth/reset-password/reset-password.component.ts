import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { AuthState } from '../../../core/state/auth.state';
import * as AuthActions from '../../../core/state/auth.actions';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sub = new Subscription();

  loading = signal(false);
  newPasswordVisible = signal(false);
  confirmPasswordVisible = signal(false);
  errorMsg = signal<string | null>(null);
  token = signal<string | null>(null);
  email = signal<string | null>(null);

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.token.set(this.route.snapshot.queryParamMap.get('token'));
    this.email.set(this.route.snapshot.queryParamMap.get('email'));

    this.sub.add(
      this.store.select(AuthState.error).subscribe((err) => {
        this.errorMsg.set(err);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.store.dispatch(new AuthActions.ClearAuthError());
  }

  toggleNewPassword(): void {
    this.newPasswordVisible.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.confirmPasswordVisible.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const token = this.token();
    const email = this.email();
    if (!token || !email) {
      this.errorMsg.set('This password reset link is invalid or incomplete.');
      return;
    }

    this.loading.set(true);
    const { newPassword } = this.form.value;

    this.store.dispatch(new AuthActions.ResetPassword(token, email, newPassword!)).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
