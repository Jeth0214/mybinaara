import { Component, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { AuthState } from '../../../core/state/auth.state';
import * as AuthActions from '../../../core/state/auth.actions';
import { EMAIL_PATTERN } from '../../../core/validators/email.validator';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private sub = new Subscription();

  loading = signal(false);
  errorMsg = signal<string | null>(null);
  submitted = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
  });

  constructor() {
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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const email = this.form.value.email!.trim().toLowerCase();

    this.store.dispatch(new AuthActions.ForgotPassword(email)).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
