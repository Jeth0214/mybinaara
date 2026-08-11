import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { AuthState } from '../../../core/state/auth.state';
import * as AuthActions from '../../../core/state/auth.actions';
import { EMAIL_PATTERN } from '../../../core/validators/email.validator';

@Component({
  selector: 'app-activation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatStepperModule],
  templateUrl: './activation.component.html',
  styleUrl: './activation.component.scss',
})
export class ActivationComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sub = new Subscription();

  loading = signal<boolean>(false);
  tempPasswordVisible = signal<boolean>(false);
  newPasswordVisible = signal<boolean>(false);
  confirmPasswordVisible = signal<boolean>(false);
  showIntroOverlay = signal<boolean>(false);

  private fallbackTimeoutId: any = null;

  // Exposing store state
  errorMsg = signal<string | null>(null);
  token = signal<string | null>(null);

  // Step 1: Registered Email + Current (temporary) password
  step1Form = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    currentPassword: ['', [Validators.required]],
  });

  // Step 2: Set New Password
  step2Form = this.fb.group({
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
    // Custom group validator to ensure the new password is not the same as the current password
    this.step2Form.addValidators((control: AbstractControl) => {
      const newPassword = control.get('newPassword');
      const currentPasswordVal = this.step1Form.get('currentPassword')?.value;
      if (newPassword && currentPasswordVal && newPassword.value === currentPasswordVal) {
        return { sameAsTemporary: true };
      }
      return null;
    });

    this.token.set(this.route.snapshot.queryParamMap.get('token'));

    // Redirect if already authenticated and activated
    const currentUser = this.store.selectSignal(AuthState.user)();
    if (currentUser && currentUser.isActivated) {
      this.router.navigate(['/settings/profile']);
      return;
    }

    // Subscribe to error state from store
    this.sub.add(
      this.store.select(AuthState.error).subscribe((err) => {
        this.errorMsg.set(err);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.store.dispatch(new AuthActions.ClearAuthError());
    if (this.fallbackTimeoutId) {
      clearTimeout(this.fallbackTimeoutId);
    }
  }

  toggleTempPassword(): void {
    this.tempPasswordVisible.update((v) => !v);
  }

  toggleNewPassword(): void {
    this.newPasswordVisible.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.confirmPasswordVisible.update((v) => !v);
  }

  // --- Form Submissions ---

  onSubmitStep1(stepper: MatStepper): void {
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }

    const token = this.token();
    if (!token) {
      this.errorMsg.set('This activation link is invalid or incomplete.');
      return;
    }

    this.loading.set(true);
    const { email, currentPassword } = this.step1Form.value;

    this.store.dispatch(new AuthActions.VerifyActivationCredentials(token, this.normalizeEmail(email!), currentPassword!)).subscribe({
      next: () => {
        this.loading.set(false);
        stepper.next();
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSubmitStep2(): void {
    if (this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      return;
    }

    const token = this.token();
    if (!token) {
      this.errorMsg.set('This activation link is invalid or incomplete.');
      return;
    }

    this.loading.set(true);
    const { email, currentPassword } = this.step1Form.value;
    const { newPassword } = this.step2Form.value;

    this.store.dispatch(new AuthActions.ActivateStore(token, this.normalizeEmail(email!), currentPassword!, newPassword!)).subscribe({
      next: () => {
        this.loading.set(false);
        this.playIntroVideo();
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private playIntroVideo(): void {
    this.showIntroOverlay.set(true);
    // Safety fallback: if video is blocked or hangs, redirect after 10 seconds
    this.fallbackTimeoutId = setTimeout(() => {
      this.completeActivationRedirect();
    }, 10000);
  }

  onIntroEnded(): void {
    this.completeActivationRedirect();
  }

  onSkipIntro(): void {
    this.completeActivationRedirect();
  }

  private completeActivationRedirect(): void {
    if (this.fallbackTimeoutId) {
      clearTimeout(this.fallbackTimeoutId);
      this.fallbackTimeoutId = null;
    }
    this.showIntroOverlay.set(false);
    this.router.navigate(['/settings/profile']);
  }
}
