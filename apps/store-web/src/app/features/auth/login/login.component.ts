import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { AuthState } from '../../../core/state/auth.state';
import * as AuthActions from '../../../core/state/auth.actions';
import { LockoutError } from '../../../core/utils/http-error.util';
import { EMAIL_PATTERN } from '../../../core/validators/email.validator';

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

  lockedUntil = signal<Date | null>(null);
  remainingSeconds = signal(0);
  isLocked = computed(() => this.lockedUntil() !== null && this.remainingSeconds() > 0);
  remainingTimeLabel = computed(() => {
    const total = this.remainingSeconds();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  private countdownIntervalId: any = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
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
        this.errorMsg.set(err);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.store.dispatch(new AuthActions.ClearAuthError());
    this.stopCountdown();
  }

  onLogin(): void {
    if (this.form.invalid || this.isLocked()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { email, password, remember } = this.form.value;

    this.store.dispatch(new AuthActions.Login(email!, password!, !!remember)).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err instanceof LockoutError) {
          this.lockedUntil.set(err.lockedUntil);
          this.startCountdown();
        }
      }
    });
  }

  togglePassword(): void {
    this.passwordVisible.update(v => !v);
  }

  private startCountdown(): void {
    this.stopCountdown();
    this.tickCountdown();
    this.countdownIntervalId = setInterval(() => this.tickCountdown(), 1000);
  }

  private tickCountdown(): void {
    const lockedUntil = this.lockedUntil();
    if (!lockedUntil) {
      this.stopCountdown();
      return;
    }

    const secondsLeft = Math.max(0, Math.floor((lockedUntil.getTime() - Date.now()) / 1000));
    this.remainingSeconds.set(secondsLeft);

    if (secondsLeft === 0) {
      this.stopCountdown();
      this.lockedUntil.set(null);
      this.errorMsg.set(null);
    }
  }

  private stopCountdown(): void {
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }
  }
}
