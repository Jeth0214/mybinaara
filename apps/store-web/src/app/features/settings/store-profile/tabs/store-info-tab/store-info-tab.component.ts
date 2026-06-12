import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { AuthState } from '../../../../../core/state/auth.state';
import { UpdateProfile } from '../../../../../core/state/auth.actions';
import { StoreSchedule } from '../../../../../core/models/auth.model';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-store-info-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './store-info-tab.component.html',
  styleUrl: './store-info-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreInfoTabComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private toastService = inject(ToastService);

  // State Signals
  readonly currentUser = this.store.selectSignal(AuthState.user);
  readonly loading = this.store.selectSignal(AuthState.loading);

  infoForm!: FormGroup;
  logoPreview = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Days list for working hours
  readonly days: Array<{ key: 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri'; label: string }> = [
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' },
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
  ];

  // Available cities in Saudi Arabia
  readonly cities = ['Jeddah', 'Riyadh', 'Dammam', 'Mecca', 'Medina', 'Khobar', 'Tabuk', 'Abha'];

  // Generated time slots in 30-minute intervals for select inputs
  readonly timeSlots: string[] = (() => {
    const slots: string[] = [];
    const periods = ['AM', 'PM'];
    for (let p = 0; p < 2; p++) {
      const period = periods[p];
      slots.push(`12:00 ${period}`);
      slots.push(`12:30 ${period}`);
      for (let h = 1; h <= 11; h++) {
        const hourStr = h.toString().padStart(2, '0');
        slots.push(`${hourStr}:00 ${period}`);
        slots.push(`${hourStr}:30 ${period}`);
      }
    }
    return slots;
  })();

  ngOnInit(): void {
    this.initForms();
  }

  private initForms(): void {
    const user = this.currentUser();

    // Default working hours if not set
    const defaultHours: StoreSchedule = user?.workingHours || {
      sat: { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      sun: { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      mon: { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      tue: { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      wed: { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      thu: { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      fri: { openTime: '', closeTime: '', isOff: true },
    };

    if (user?.logoUrl) {
      this.logoPreview.set(user.logoUrl);
    }

    // 1. Store Info Form Group
    this.infoForm = this.fb.group({
      storeName: [{ value: user?.storeName || '', disabled: true }, [Validators.required]],
      city: [{ value: user?.city || 'Jeddah', disabled: true }, [Validators.required]],
      whatsapp: [{ value: user?.whatsapp || '', disabled: true }, [Validators.required]],
      phone: [{ value: user?.phone || '', disabled: true }, [Validators.required]],
      businessId: [{ value: user?.businessId || '', disabled: true }],
      certificateId: [{ value: user?.certificateId || '', disabled: true }],
      workingHours: this.fb.group(
        this.days.reduce((acc, day) => {
          const sched = defaultHours[day.key] || { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false };
          acc[day.key] = this.fb.group({
            openTime: [{ value: sched.openTime, disabled: sched.isOff }],
            closeTime: [{ value: sched.closeTime, disabled: sched.isOff }],
            isOff: [sched.isOff],
          });
          return acc;
        }, {} as any)
      ),
    });

    // Subscribing to "Off" checkboxes to disable/enable timing inputs
    this.days.forEach((day) => {
      const dayGroup = this.infoForm.get(`workingHours.${day.key}`) as FormGroup;
      if (dayGroup) {
        dayGroup.get('isOff')?.valueChanges.subscribe((isOff: boolean) => {
          const openCtrl = dayGroup.get('openTime');
          const closeCtrl = dayGroup.get('closeTime');
          if (isOff) {
            openCtrl?.disable();
            closeCtrl?.disable();
            openCtrl?.setValue('');
            closeCtrl?.setValue('');
          } else {
            openCtrl?.enable();
            closeCtrl?.enable();
            openCtrl?.setValue('08:00 AM');
            closeCtrl?.setValue('09:00 PM');
          }
        });
      }
    });
  }

  onSaveInfo(): void {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    const val = this.infoForm.getRawValue();

    const payload = {
      storeName: val.storeName,
      logoUrl: this.logoPreview() || undefined,
      city: val.city,
      phone: val.phone,
      whatsapp: val.whatsapp,
      workingHours: val.workingHours as StoreSchedule,
    };

    this.store.dispatch(new UpdateProfile(payload)).subscribe({
      next: () => {
        this.toastService.success('Store profile updated successfully.');
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        this.toastService.error(err?.message || 'Failed to update profile.');
      }
    });
  }

  onDiscardInfo(): void {
    this.initForms();
    this.toastService.info('Changes discarded.');
  }
}
