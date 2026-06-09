import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { AuthState } from '../../../core/state/auth.state';
import * as AuthActions from '../../../core/state/auth.actions';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private sub = new Subscription();

  loading = signal(false);
  passwordVisible = signal(false);
  errorMsg = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    remember: [false],
  });

  ngOnInit(): void {
    // Redirect if already authenticated
    const currentUser = this.store.selectSignal(AuthState.user)();
    if (currentUser && currentUser.isActivated) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.sub.add(
      this.store.select(AuthState.error).subscribe((err) => {
        if (err === 'ACCOUNT_NOT_ACTIVATED') {
          this.errorMsg.set('Your store account is verified but not yet activated. Please use the activation link below to set up your password.');
        } else {
          this.errorMsg.set(err);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.store.dispatch(new AuthActions.ClearAuthError());
  }

  onLogin(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { email, password } = this.form.value;

    this.store.dispatch(new AuthActions.Login(email!, password!)).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  togglePassword(): void {
    this.passwordVisible.update(v => !v);
  }
}
