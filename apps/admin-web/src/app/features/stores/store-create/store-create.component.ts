import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { Observable, forkJoin } from 'rxjs';
import { StoreService } from '../../../core/services/store.service';
import { ToastService } from '../../../core/services/toast.service';
import { SCHEDULE_DAYS, ScheduleDay, Store, StoreScheduleDay } from '../../../core/models/store.model';
import { SAUDI_PHONE_PATTERN } from '../../../core/validators/phone.validator';
import { appendFormData } from '../../../core/utils/form-data.util';

import { StoreStepBusinessComponent } from './components/store-step-business/store-step-business.component';
import { StoreStepLocationScheduleComponent } from './components/store-step-location-schedule/store-step-location-schedule.component';
import { StoreStepRegistryComponent } from './components/store-step-registry/store-step-registry.component';
import { StoreStepReviewComponent } from './components/store-step-review/store-step-review.component';

const DEFAULT_OPEN_TIME = '08:00 AM';
const DEFAULT_CLOSE_TIME = '09:00 PM';

@Component({
  selector: 'app-store-create',
  standalone: true,
  imports: [
    RouterLink,
    MatStepperModule,
    StoreStepBusinessComponent,
    StoreStepLocationScheduleComponent,
    StoreStepRegistryComponent,
    StoreStepReviewComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-create.component.html',
  styleUrl: './store-create.component.scss'
})
export class StoreCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly storeService = inject(StoreService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isEditMode = signal(false);
  readonly storeId = signal<number | null>(null);

  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly isCreated = signal(false);
  readonly createdOwnerEmail = signal<string | null>(null);
  readonly existingLogoUrl = signal<string | null>(null);
  /** Legacy stores may have a free-text city/district name but no city_id/district_id yet. */
  readonly legacyCityName = signal<string | null>(null);
  readonly legacyDistrictName = signal<string | null>(null);
  /** Set by the vendor post-activation; shown read-only for admin reference, never editable here. */
  readonly existingLatitude = signal<number | null>(null);
  readonly existingLongitude = signal<number | null>(null);

  // Step 1: Business Info (Branding & Owner)
  readonly step1Form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    logo: [null as File | null],
    removeLogo: [false],
    owner_name: ['', [Validators.required, Validators.minLength(3)]],
    owner_email: ['', [Validators.required, Validators.email]],
    owner_phone: ['', [Validators.required, Validators.pattern(SAUDI_PHONE_PATTERN)]],
    owner_whatsapp: ['', [Validators.required, Validators.pattern(SAUDI_PHONE_PATTERN)]]
  });

  // Step 2: Location (optional) and Schedule (required)
  readonly step2Form = this.fb.group({
    location: this.fb.group(
      {
        country: ['Saudi Arabia'],
        city_id: [null as number | null],
        district_id: [null as number | null],
        building_number: [''],
        street_name: [''],
        postal_code: [''],
        additional_number: [''],
        full_address: ['']
      },
      { validators: [locationRequiredWhenFilledValidator] }
    ),
    workingHours: this.fb.group(
      SCHEDULE_DAYS.reduce((acc, dayKey) => {
        const isFri = dayKey === 'fri';
        acc[dayKey] = this.fb.group({
          openTime: [{ value: isFri ? '' : DEFAULT_OPEN_TIME, disabled: isFri }],
          closeTime: [{ value: isFri ? '' : DEFAULT_CLOSE_TIME, disabled: isFri }],
          isOff: [isFri]
        });
        return acc;
      }, {} as any)
    )
  });

  // Step 3: Saudi Registry
  readonly step3Form = this.fb.group({
    crNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    vatNumber: ['', [Validators.required, Validators.pattern('^3[0-9]{14}$')]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEditMode.set(true);
    this.storeId.set(+id);
    this.setupWorkingHoursListeners();

    this.loading.set(true);
    this.storeService.getStore(+id).subscribe({
      next: (store) => this.patchFormsFromStore(store),
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err?.message ?? 'Store not found.');
        this.router.navigate(['/stores']);
      }
    });
  }

  private patchFormsFromStore(store: Store): void {
    this.loading.set(false);
    this.existingLogoUrl.set(store.logo_url);

    this.step1Form.patchValue({
      name: store.name,
      owner_name: store.owner?.name ?? '',
      owner_email: store.owner?.email ?? '',
      owner_phone: store.owner?.phone ?? '',
      owner_whatsapp: store.owner?.whatsapp ?? ''
    });
    ['owner_name', 'owner_email', 'owner_phone', 'owner_whatsapp'].forEach((c) => this.step1Form.get(c)?.disable());

    if (!store.location?.city_id) {
      this.legacyCityName.set(store.location?.city ?? null);
    }
    if (!store.location?.district_id) {
      this.legacyDistrictName.set(store.location?.district ?? null);
    }
    this.existingLatitude.set(store.location?.latitude ?? null);
    this.existingLongitude.set(store.location?.longitude ?? null);

    const locationGroup = this.step2Form.get('location') as FormGroup;
    locationGroup.patchValue({
      country: store.location?.country ?? 'Saudi Arabia',
      city_id: store.location?.city_id ?? null,
      district_id: store.location?.district_id ?? null,
      building_number: store.location?.building_number ?? '',
      street_name: store.location?.street_name ?? '',
      postal_code: store.location?.postal_code ?? '',
      additional_number: store.location?.additional_number ?? '',
      full_address: store.location?.full_address ?? ''
    });

    const workingHoursGroup = this.step2Form.get('workingHours') as FormGroup;
    const schedule = store.schedule?.length ? store.schedule : this.defaultSchedule();
    schedule.forEach((item) => {
      const dayGroup = workingHoursGroup.get(item.day) as FormGroup;
      if (!dayGroup) return;
      dayGroup.patchValue({
        openTime: item.open_time ?? '',
        closeTime: item.close_time ?? '',
        isOff: item.is_off
      });
      if (item.is_off) {
        dayGroup.get('openTime')?.disable();
        dayGroup.get('closeTime')?.disable();
      } else {
        dayGroup.get('openTime')?.enable();
        dayGroup.get('closeTime')?.enable();
      }
    });

    this.step3Form.patchValue({
      crNumber: store.cr_number,
      vatNumber: store.vat_number
    });
  }

  private defaultSchedule(): StoreScheduleDay[] {
    return SCHEDULE_DAYS.map((day) => ({
      day,
      is_off: day === 'fri',
      open_time: day === 'fri' ? null : DEFAULT_OPEN_TIME,
      close_time: day === 'fri' ? null : DEFAULT_CLOSE_TIME
    }));
  }

  private setupWorkingHoursListeners(): void {
    SCHEDULE_DAYS.forEach((dayKey) => {
      const dayGroup = this.step2Form.get(`workingHours.${dayKey}`) as FormGroup;
      dayGroup?.get('isOff')?.valueChanges.subscribe((isOff: boolean) => {
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
          openCtrl?.setValue(DEFAULT_OPEN_TIME);
          closeCtrl?.setValue(DEFAULT_CLOSE_TIME);
        }
      });
    });
  }

  private buildScheduleArray(): StoreScheduleDay[] {
    const raw = this.step2Form.getRawValue().workingHours as Record<ScheduleDay, { openTime: string; closeTime: string; isOff: boolean }>;
    return SCHEDULE_DAYS.map((day) => ({
      day,
      is_off: !!raw[day]?.isOff,
      open_time: raw[day]?.isOff ? null : raw[day]?.openTime || null,
      close_time: raw[day]?.isOff ? null : raw[day]?.closeTime || null
    }));
  }

  /** Returns the location payload, or null when no address information was entered. */
  private buildLocationPayload(): Record<string, unknown> | null {
    const raw = (this.step2Form.get('location') as FormGroup).getRawValue();
    if (!raw.full_address || !String(raw.full_address).trim()) {
      return null;
    }

    return {
      full_address: raw.full_address,
      building_number: raw.building_number || null,
      street_name: raw.street_name || null,
      district_id: raw.district_id || null,
      city_id: raw.city_id || null,
      postal_code: raw.postal_code || null,
      additional_number: raw.additional_number || null,
      country: raw.country || null
    };
  }

  submitStore(): void {
    if (this.step1Form.invalid || this.step2Form.invalid || this.step3Form.invalid) {
      this.step1Form.markAllAsTouched();
      this.step2Form.markAllAsTouched();
      this.step3Form.markAllAsTouched();
      this.toast.error('Please resolve all validation errors before saving.');
      return;
    }

    const id = this.storeId();
    if (this.isEditMode() && id) {
      this.submitUpdate(id);
    } else {
      this.submitCreate();
    }
  }

  private submitCreate(): void {
    this.submitting.set(true);
    const raw1 = this.step1Form.getRawValue();
    const raw3 = this.step3Form.getRawValue();

    const formData = new FormData();
    appendFormData(formData, 'name', raw1.name);
    appendFormData(formData, 'cr_number', raw3.crNumber);
    appendFormData(formData, 'vat_number', raw3.vatNumber);
    appendFormData(formData, 'owner_name', raw1.owner_name);
    appendFormData(formData, 'owner_email', raw1.owner_email);
    appendFormData(formData, 'owner_phone', raw1.owner_phone);
    appendFormData(formData, 'owner_whatsapp', raw1.owner_whatsapp);
    if (raw1.logo) {
      appendFormData(formData, 'logo', raw1.logo);
    }

    const locationPayload = this.buildLocationPayload();
    if (locationPayload) {
      appendFormData(formData, 'location', locationPayload);
    }
    appendFormData(formData, 'schedule', this.buildScheduleArray());

    this.storeService.createStore(formData).subscribe({
      next: (store) => {
        this.submitting.set(false);
        this.isCreated.set(true);
        this.createdOwnerEmail.set(store.owner?.email ?? raw1.owner_email ?? null);
        this.toast.success(`Store "${store.name}" registered successfully.`);
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(err?.message ?? 'An error occurred while creating the store.');
      }
    });
  }

  private submitUpdate(id: number): void {
    this.submitting.set(true);
    const raw1 = this.step1Form.getRawValue();
    const raw3 = this.step3Form.getRawValue();

    const baseFormData = new FormData();
    appendFormData(baseFormData, 'name', raw1.name);
    appendFormData(baseFormData, 'cr_number', raw3.crNumber);
    appendFormData(baseFormData, 'vat_number', raw3.vatNumber);
    if (raw1.removeLogo && !raw1.logo) {
      baseFormData.append('logo_url', '');
    }

    const calls: Observable<Store>[] = [this.storeService.updateStore(id, baseFormData)];

    if (raw1.logo) {
      calls.push(this.storeService.updateStoreLogo(id, raw1.logo));
    }

    const addressPayload = this.buildLocationPayload();
    if (addressPayload) {
      calls.push(this.storeService.updateStoreAddress(id, addressPayload));
    }

    calls.push(this.storeService.updateStoreSchedule(id, this.buildScheduleArray()));

    forkJoin(calls).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success(`Store "${raw1.name}" updated successfully.`);
        this.router.navigate(['/stores', id]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(err?.message ?? 'Failed to update store.');
      }
    });
  }

  goToStoreList(): void {
    this.router.navigate(['/stores']);
  }
}

/** Backend requires `full_address` once any other location field is filled. */
function locationRequiredWhenFilledValidator(control: AbstractControl): ValidationErrors | null {
  const group = control as FormGroup;
  const watchedFields = ['building_number', 'street_name', 'district_id', 'city_id', 'postal_code', 'additional_number'];
  const hasAnyValue = watchedFields.some((field) => {
    const value = group.get(field)?.value;
    return value !== null && value !== undefined && value !== '';
  });

  const fullAddressCtrl = group.get('full_address');
  if (hasAnyValue && !fullAddressCtrl?.value) {
    fullAddressCtrl?.setErrors({ required: true });
    return { locationIncomplete: true };
  }

  if (fullAddressCtrl?.hasError('required') && !hasAnyValue) {
    fullAddressCtrl.setErrors(null);
  }

  return null;
}
