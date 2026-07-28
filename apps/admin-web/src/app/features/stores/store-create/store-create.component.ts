import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatStepperModule } from '@angular/material/stepper';
import { StoreService } from '../../../core/services/store.service';
import { ToastService } from '../../../core/services/toast.service';
import { StoreDaySchedule } from '../../../core/models/store.model';
import { SAUDI_PHONE_PATTERN } from '../../../core/validators/phone.validator';

import { StoreStepBusinessComponent } from './components/store-step-business/store-step-business.component';
import { StoreStepLocationScheduleComponent } from './components/store-step-location-schedule/store-step-location-schedule.component';
import { StoreStepRegistryComponent } from './components/store-step-registry/store-step-registry.component';
import { StoreStepReviewComponent } from './components/store-step-review/store-step-review.component';

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
  private readonly sanitizer = inject(DomSanitizer);

  // Wizard Navigation Step Tracking (for non-stepper logic/credentials)
  readonly currentStepIndex = signal(0);

  // Edit Mode Signals
  readonly isEditMode = signal(false);
  readonly storeId = signal<string | null>(null);

  // Generated Credentials Signals
  readonly tempPassword = signal('');
  readonly isCreated = signal(false);
  readonly isNotified = signal(false);

  readonly isPendingAccount = signal(false);
  readonly loading = signal(false);

  // Step 1: Business Info (Branding & Owners)
  readonly step1Form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    storeLogo: ['', Validators.required],
    isActivated: [false],
    ownerName: ['', [Validators.required, Validators.minLength(3)]],
    ownerEmail: ['', [Validators.required, Validators.email]],
    ownerPhone: ['', [Validators.required, Validators.pattern(SAUDI_PHONE_PATTERN)]],
    ownerWhatsapp: ['', [Validators.required, Validators.pattern(SAUDI_PHONE_PATTERN)]]
  });
  // Step 2: Location and Schedule (Operational parameters)
  readonly step2Form = this.fb.group({
    location: this.fb.group({
      country: ['Saudi Arabia', Validators.required],
      city: ['', Validators.required],
      district: [{ value: '', disabled: true }, Validators.required],
      building_number: [''],
      street_name: [''],
      postal_code: [''],
      additional_number: [''],
      fullAddress: ['', Validators.required],
      latitude: [null as number | null, [Validators.min(-90), Validators.max(90)]],
      longitude: [null as number | null, [Validators.min(-180), Validators.max(180)]],
      plus_code: ['']
    }),
    workingHours: this.fb.group(
      ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'].reduce((acc, dayKey) => {
        const isFri = dayKey === 'fri';
        acc[dayKey] = this.fb.group({
          openTime: [{ value: isFri ? '' : '08:00 AM', disabled: isFri }],
          closeTime: [{ value: isFri ? '' : '09:00 PM', disabled: isFri }],
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
    if (id) {
      this.isEditMode.set(true);
      this.storeId.set(id);
      const store = this.storeService.getStoreById(id);
      if (store) {
        this.isPendingAccount.set(store.status === 'pending');
        
        // Step 1 Form Patch
        this.step1Form.patchValue({
          name: store.name,
          storeLogo: store.storeLogo || '',
          isActivated: store.isActivated,
          ownerName: store.ownerName,
          ownerEmail: store.ownerEmail,
          ownerPhone: store.ownerPhone,
          ownerWhatsapp: store.ownerWhatsapp
        });

        // Step 2 Form (Location & Schedule) Patch
        const locationGroup = this.step2Form.get('location') as FormGroup;
        if (store.location && store.location.city) {
          locationGroup.get('district')?.enable();
        }
        locationGroup.patchValue({
          country: store.location.country || 'Saudi Arabia',
          city: store.location.city || '',
          district: store.location.district || '',
          building_number: store.location.buildingNumber || '',
          street_name: store.location.streetName || '',
          postal_code: store.location.postalCode || '',
          additional_number: store.location.additionalNumber || '',
          fullAddress: store.location.fullAddress || '',
          latitude: store.location.latitude,
          longitude: store.location.longitude,
          plus_code: store.location.plusCode || ''
        });

        const storeSchedule = store.schedule || [
          { day: 'sat', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
          { day: 'sun', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
          { day: 'mon', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
          { day: 'tue', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
          { day: 'wed', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
          { day: 'thu', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
          { day: 'fri', openTime: '', closeTime: '', isOff: true }
        ];

        const workingHoursGroup = this.step2Form.get('workingHours') as FormGroup;
        if (workingHoursGroup) {
          storeSchedule.forEach(item => {
            const dayGroup = workingHoursGroup.get(item.day) as FormGroup;
            if (dayGroup) {
              dayGroup.patchValue({
                openTime: item.openTime,
                closeTime: item.closeTime,
                isOff: item.isOff
              });
              if (item.isOff) {
                dayGroup.get('openTime')?.disable();
                dayGroup.get('closeTime')?.disable();
              } else {
                dayGroup.get('openTime')?.enable();
                dayGroup.get('closeTime')?.enable();
              }
            }
          });
        }

        // Step 3 Form Patch (Registry)
        this.step3Form.patchValue({
          crNumber: store.crNumber,
          vatNumber: store.vatNumber
        });
      } else {
        this.toast.error('Store not found.');
        this.router.navigate(['/stores']);
      }
    }
    this.setupWorkingHoursListeners();
  }

  private setupWorkingHoursListeners(): void {
    const daysKeys = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
    daysKeys.forEach((dayKey) => {
      const dayGroup = this.step2Form.get(`workingHours.${dayKey}`) as FormGroup;
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

  getMapUrl(): SafeResourceUrl | null {
    const loc = this.step2Form.value.location;
    const lat = loc?.latitude;
    const lng = loc?.longitude;
    if (lat === null || lng === null || lat === undefined || lng === undefined || isNaN(Number(lat)) || isNaN(Number(lng))) {
      return null;
    }
    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onStepChange(event: any): void {
    this.currentStepIndex.set(event.selectedIndex);

    // In Create mode, step 4 (index 3) generates credentials and creates the record automatically
    if (event.selectedIndex === 3 && !this.isEditMode() && !this.isCreated()) {
      this.generatePreviewCredentials();
      this.submitStore();
    }
  }

  generatePreviewCredentials(): void {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.tempPassword.set(`Binaara${randomHex}!`);
  }

  submitStore(): void {
    if (this.step1Form.invalid || this.step2Form.invalid || this.step3Form.invalid) {
      this.toast.error('Please resolve all validation errors before saving.');
      return;
    }

    this.loading.set(true);

    setTimeout(() => {
      const workingHoursVal = this.step2Form.getRawValue().workingHours as any;
      const scheduleArray: StoreDaySchedule[] = Object.keys(workingHoursVal || {}).map(day => ({
        day: day as any,
        openTime: workingHoursVal[day]?.openTime || '',
        closeTime: workingHoursVal[day]?.closeTime || '',
        isOff: !!workingHoursVal[day]?.isOff
      }));

      const rawLocation = this.step2Form.getRawValue().location as any;
      const storeData = {
        name: this.step1Form.value.name!,
        location: {
          fullAddress: rawLocation.fullAddress || '',
          buildingNumber: rawLocation.building_number || '',
          streetName: rawLocation.street_name || '',
          district: rawLocation.district || '',
          city: rawLocation.city || '',
          postalCode: rawLocation.postal_code || '',
          additionalNumber: rawLocation.additional_number || '',
          country: rawLocation.country || 'Saudi Arabia',
          latitude: rawLocation.latitude !== null && rawLocation.latitude !== undefined ? Number(rawLocation.latitude) : undefined,
          longitude: rawLocation.longitude !== null && rawLocation.longitude !== undefined ? Number(rawLocation.longitude) : undefined,
          plusCode: rawLocation.plus_code || ''
        },
        storeLogo: this.step1Form.value.storeLogo || '',
        isActivated: !!this.step1Form.value.isActivated,
        status: this.isEditMode() 
          ? (this.step1Form.value.isActivated ? 'active' as const : 'pending' as const) 
          : 'pending' as const,
        crNumber: this.step3Form.value.crNumber!,
        vatNumber: this.step3Form.value.vatNumber!,
        ownerName: this.step1Form.value.ownerName!,
        ownerEmail: this.step1Form.value.ownerEmail!,
        ownerPhone: this.step1Form.value.ownerPhone!,
        ownerWhatsapp: this.step1Form.value.ownerWhatsapp!,
        schedule: scheduleArray
      };

      const documents = [
        { type: 'cr' as const, status: 'approved' as const, uploadedAt: new Date().toISOString() },
        { type: 'vat' as const, status: 'approved' as const, uploadedAt: new Date().toISOString() }
      ];

      try {
        if (this.isEditMode()) {
          const id = this.storeId();
          if (id) {
            this.storeService.updateStore(id, { ...storeData, documents });
            this.toast.success(`Store "${storeData.name}" changes saved successfully.`);
            this.router.navigate(['/stores']);
          }
        } else {
          const newStoreData = {
            ...storeData,
            documents,
            tempPassword: this.tempPassword()
          };
          this.storeService.createStore(newStoreData);
          this.isCreated.set(true);
          this.toast.success(`Store "${newStoreData.name}" registered and credentials generated!`);
        }
      } catch (err) {
        this.toast.error(`An error occurred while saving the store.`);
      } finally {
        this.loading.set(false);
      }
    }, 800);
  }

  copyToClipboard(text: string, label: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.toast.info(`${label} copied to clipboard!`);
    });
  }

  notifyMerchant(): void {
    this.isNotified.set(true);
    this.toast.success('Merchant has been notified with activation instructions via email!');
  }

  resetAndExit(): void {
    this.router.navigate(['/stores']);
  }
}
