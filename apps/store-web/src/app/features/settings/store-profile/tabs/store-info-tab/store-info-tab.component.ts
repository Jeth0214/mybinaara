import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';
import { AuthState } from '../../../../../core/state/auth.state';
import { RefreshStore, RemoveLogo, UpdateLogo, UpdateProfile, UpdateStoreLocation } from '../../../../../core/state/auth.actions';
import { StoreSchedule } from '../../../../../core/models/auth.model';
import { StoreLocation } from '../../../../../core/models/store-location.model';
import { ToastService } from '../../../../../core/services/toast.service';
import { StoreLocationPickerComponent } from './store-location-picker/store-location-picker.component';

const ACCEPTED_LOGO_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_LOGO_SIZE = 2 * 1024 * 1024;

@Component({
  selector: 'app-store-info-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StoreLocationPickerComponent],
  templateUrl: './store-info-tab.component.html',
  styleUrl: './store-info-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreInfoTabComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private toastService = inject(ToastService);

  // State Signals
  readonly currentUser = this.store.selectSignal(AuthState.user);

  infoForm!: FormGroup;
  readonly logoError = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  readonly saving = signal(false);

  private pendingLogoFile: File | null = null;
  private pendingLogoPreviewUrl = signal<string | null>(null);
  private pendingLogoRemoved = signal(false);
  private objectUrl: string | null = null;

  /** Latest location from the map picker — kept separate from infoForm since
   *  the picker manages its own pin/geocode state, not a form control. */
  private pendingLocation: StoreLocation | null = null;

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

    // Re-pull the store's current data on every visit to this tab — the
    // cached session can be stale (e.g. an admin changed the schedule).
    // Only re-populate the form if the user hasn't started editing yet, so
    // we never clobber unsaved changes.
    this.store.dispatch(new RefreshStore()).subscribe(() => {
      if (this.infoForm.pristine) {
        this.initForms();
      }
    });
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
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
      fri: { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
    };

    // 1. Store Info Form Group
    this.infoForm = this.fb.group({
      storeName: [{ value: user?.storeName || '', disabled: true }, [Validators.required]],
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

  onLocationChange(location: StoreLocation): void {
    this.pendingLocation = location;
  }

  /** Returns null if the vendor just removed the logo (even though the
   *  persisted user record still has the old logoUrl until Save), else the
   *  freshly-picked file's preview, else the currently persisted logo. */
  currentLogoPreview(): string | null {
    if (this.pendingLogoRemoved()) {
      return null;
    }
    return this.pendingLogoPreviewUrl() ?? this.currentUser()?.logoUrl ?? null;
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.logoError.set(null);

    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      this.logoError.set('Only JPG, PNG, or WEBP images are allowed.');
      input.value = '';
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      this.logoError.set('File size exceeds 2MB limit. Please upload a smaller image.');
      input.value = '';
      return;
    }

    this.pendingLogoFile = file;
    this.pendingLogoRemoved.set(false);

    this.revokeObjectUrl();
    this.objectUrl = URL.createObjectURL(file);
    this.pendingLogoPreviewUrl.set(this.objectUrl);
    input.value = '';
  }

  removeLogo(): void {
    this.pendingLogoFile = null;
    this.pendingLogoRemoved.set(true);
    this.logoError.set(null);
    this.revokeObjectUrl();
    this.pendingLogoPreviewUrl.set(null);
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  onSaveInfo(): void {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    const val = this.infoForm.getRawValue();

    // Store name, phone, whatsapp, business/certificate IDs are shown
    // read-only on this tab (disabled controls above) — only working hours,
    // logo, and the map location are actually editable and persisted here,
    // all saved together so there's a single, reliable "Save changes" action.
    this.saving.set(true);

    const logoCall = this.pendingLogoFile
      ? this.store.dispatch(new UpdateLogo(this.pendingLogoFile))
      : this.pendingLogoRemoved()
        ? this.store.dispatch(new RemoveLogo())
        : of(null);

    forkJoin([
      this.store.dispatch(new UpdateProfile({ workingHours: val.workingHours as StoreSchedule })),
      this.pendingLocation ? this.store.dispatch(new UpdateStoreLocation(this.pendingLocation)) : of(null),
      logoCall,
    ]).subscribe({
      next: () => {
        this.saving.set(false);
        this.pendingLogoFile = null;
        this.pendingLogoRemoved.set(false);
        this.revokeObjectUrl();
        this.pendingLogoPreviewUrl.set(null);
        this.toastService.success('Store profile updated successfully.');
      },
      error: (err) => {
        this.saving.set(false);
        console.error('Failed to update store profile:', err);
        this.toastService.error(err?.message || 'Failed to update store profile.');
      }
    });
  }

  onDiscardInfo(): void {
    this.pendingLogoFile = null;
    this.pendingLogoRemoved.set(false);
    this.logoError.set(null);
    this.revokeObjectUrl();
    this.pendingLogoPreviewUrl.set(null);
    this.initForms();
    this.toastService.info('Changes discarded.');
  }
}
