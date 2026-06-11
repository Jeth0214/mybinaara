import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { AuthState } from '../../../../../core/state/auth.state';
import { ChangePassword } from '../../../../../core/state/auth.actions';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-store-security-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './store-security-tab.component.html',
  styleUrl: './store-security-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreSecurityTabComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private toastService = inject(ToastService);

  readonly loading = this.store.selectSignal(AuthState.loading);

  securityForm!: FormGroup;

  // Password Visibility Signals
  currentPassVisible = signal(false);
  newPassVisible = signal(false);
  confirmPassVisible = signal(false);

  ngOnInit(): void {
    this.initForms();
  }

  private initForms(): void {
    this.securityForm = this.fb.group({
      currentPass: ['', [Validators.required]],
      newPass: ['', [Validators.required, Validators.minLength(6)]],
      confirmPass: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: AbstractControl) {
    const newPass = g.get('newPass')?.value;
    const confirmPass = g.get('confirmPass')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  onSaveSecurity(): void {
    if (this.securityForm.invalid) {
      this.securityForm.markAllAsTouched();
      return;
    }

    const { currentPass, newPass } = this.securityForm.value;
    this.store.dispatch(new ChangePassword({ currentPass, newPass })).subscribe({
      next: () => {
        this.toastService.success('Password updated successfully.');
        this.securityForm.reset();
      },
      error: (err) => {
        console.error('Failed to change password:', err);
        this.toastService.error(err?.message || 'Failed to update password.');
      }
    });
  }

  toggleCurrentPass(): void {
    this.currentPassVisible.update((v) => !v);
  }

  toggleNewPass(): void {
    this.newPassVisible.update((v) => !v);
  }

  toggleConfirmPass(): void {
    this.confirmPassVisible.update((v) => !v);
  }
}
