import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { AuthState } from '../../../core/state/auth.state';
import * as AuthActions from '../../../core/state/auth.actions';

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
  private sub = new Subscription();

  loading = signal<boolean>(false);
  tempPasswordVisible = signal<boolean>(false);
  newPasswordVisible = signal<boolean>(false);
  confirmPasswordVisible = signal<boolean>(false);
  otpResendCountdown = signal<number>(0);
  otpResending = signal<boolean>(false);
  showIntroOverlay = signal<boolean>(false);
  
  private fallbackTimeoutId: any = null;
  
  // Exposing store state
  errorMsg = signal<string | null>(null);
  userEmail = signal<string>('');

  // Step 1: Temp Login Form
  step1Form = this.fb.group({
    email: ['', [Validators.required]],
    tempPassword: ['', [Validators.required]],
  });

  // Step 2: Reset Password Form
  step2Form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  // Step 3: OTP Form
  step3Form = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  ngOnInit(): void {
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

    this.loading.set(true);
    const { email, tempPassword } = this.step1Form.value;

    this.store.dispatch(new AuthActions.VerifyTemporaryCredentials(email!, tempPassword!)).subscribe({
      next: () => {
        this.loading.set(false);
        const tempSession = this.store.selectSnapshot(AuthState.tempSession);
        if (tempSession) {
          this.userEmail.set(tempSession.email);
          stepper.next();
        }
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSubmitStep2(stepper: MatStepper): void {
    if (this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { newPassword } = this.step2Form.value;
    const email = this.userEmail();

    this.store.dispatch(new AuthActions.UpdateActivationPassword(email, newPassword!)).subscribe({
      next: () => {
        this.loading.set(false);
        stepper.next();
        this.startOtpCountdown();
        // Prompt user for convenience
        alert('Mock System: OTP code sent to your registered address! Use code: 123456');
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSubmitStep3(): void {
    if (this.step3Form.invalid) {
      this.step3Form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { otp } = this.step3Form.value;
    const email = this.userEmail();

    this.store.dispatch(new AuthActions.VerifyActivationOtp(email, otp!)).subscribe({
      next: () => {
        this.loading.set(false);
        this.playIntroVideo();
      },
      error: () => {
        this.loading.set(false);
      }
    });
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

  // --- OTP Helper Functions ---

  resendOtp(): void {
    if (this.otpResendCountdown() > 0) return;

    this.otpResending.set(true);
    setTimeout(() => {
      this.otpResending.set(false);
      this.startOtpCountdown();
      alert('Mock System: Verification code resent! Use code: 123456');
    }, 1000);
  }

  private startOtpCountdown(): void {
    this.otpResendCountdown.set(30);
    const timer = setInterval(() => {
      this.otpResendCountdown.update((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }
}
