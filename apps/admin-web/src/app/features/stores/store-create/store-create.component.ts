import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatStepperModule } from '@angular/material/stepper';
import { StoreService } from '../../../core/services/store.service';
import { ToastService } from '../../../core/services/toast.service';
import { SAUDI_CITIES } from '../../../core/models/store.model';

import { StoreStepBusinessComponent } from './components/store-step-business/store-step-business.component';
import { StoreStepRegistryComponent } from './components/store-step-registry/store-step-registry.component';
import { StoreStepContactsComponent } from './components/store-step-contacts/store-step-contacts.component';
import { StoreStepDocumentsComponent } from './components/store-step-documents/store-step-documents.component';
import { StoreStepReviewComponent } from './components/store-step-review/store-step-review.component';

@Component({
  selector: 'app-store-create',
  standalone: true,
  imports: [
    RouterLink, 
    MatStepperModule,
    StoreStepBusinessComponent,
    StoreStepRegistryComponent,
    StoreStepContactsComponent,
    StoreStepDocumentsComponent,
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

  readonly cities = SAUDI_CITIES;

  // Wizard Navigation Step Tracking (for non-stepper logic/credentials)
  readonly currentStepIndex = signal(0);

  // Edit Mode Signals
  readonly isEditMode = signal(false);
  readonly storeId = signal<string | null>(null);

  // Document File Upload Tracking Signals
  readonly crFile = signal<string | null>(null);
  readonly vatFile = signal<string | null>(null);
  readonly ibanFile = signal<string | null>(null);

  // Generated Credentials Signals
  readonly tempPassword = signal('');
  readonly isCreated = signal(false);
  readonly isNotified = signal(false);

  readonly isPendingAccount = signal(false);
  readonly loading = signal(false);

  // Step 1: Location & Business (Removed Category)
  readonly step1Form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    location: ['', Validators.required],
    district: ['', [Validators.required, Validators.minLength(3)]],
    lat: [null as number | null, [Validators.required, Validators.min(-90), Validators.max(90)]],
    lng: [null as number | null, [Validators.required, Validators.min(-180), Validators.max(180)]],
    storeLogo: ['', Validators.required],
    isActivated: [false]
  });

  // Step 2: Saudi Arabia Registry Info
  readonly step2Form = this.fb.group({
    crNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    vatNumber: ['', [Validators.required, Validators.pattern('^3[0-9]{14}$')]],
    iban: ['', [Validators.required, Validators.pattern('^SA[0-9]{22}$')]]
  });

  // Step 3: Contact Details
  readonly step3Form = this.fb.group({
    ownerName: ['', [Validators.required, Validators.minLength(3)]],
    ownerEmail: ['', [Validators.required, Validators.email]],
    ownerPhone: ['', [Validators.required, Validators.pattern('^(?:\\+966|0)?5[0-9]{8}$')]],
    ownerWhatsapp: ['', [Validators.required, Validators.pattern('^(?:\\+966|0)?5[0-9]{8}$')]]
  });

  // Step 4: Document Upload Validation Form
  readonly step4Form = this.fb.group({
    crUploaded: [false, Validators.requiredTrue],
    vatUploaded: [false, Validators.requiredTrue],
    ibanUploaded: [false, Validators.requiredTrue]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.storeId.set(id);
      const store = this.storeService.getStoreById(id);
      if (store) {
        this.isPendingAccount.set(store.status === 'pending');
        this.step1Form.patchValue({
          name: store.name,
          location: store.location,
          district: store.district,
          lat: store.lat,
          lng: store.lng,
          storeLogo: store.storeLogo || '',
          isActivated: store.isActivated
        });
        this.step2Form.patchValue({
          crNumber: store.crNumber,
          vatNumber: store.vatNumber,
          iban: store.iban
        });
        this.step3Form.patchValue({
          ownerName: store.ownerName,
          ownerEmail: store.ownerEmail,
          ownerPhone: store.ownerPhone,
          ownerWhatsapp: store.ownerWhatsapp
        });

        // Set uploaded status to true in edit mode since they already exist
        this.step4Form.patchValue({
          crUploaded: true,
          vatUploaded: true,
          ibanUploaded: true
        });

        this.crFile.set(store.documents.find(d => d.type === 'cr')?.fileName || 'commercial_registration.pdf');
        this.vatFile.set(store.documents.find(d => d.type === 'vat')?.fileName || 'vat_certificate.pdf');
        this.ibanFile.set(store.documents.find(d => d.type === 'iban')?.fileName || 'iban_letter.pdf');
      } else {
        this.toast.error('Store not found.');
        this.router.navigate(['/stores']);
      }
    }
  }

  getMapUrl(): SafeResourceUrl | null {
    const lat = this.step1Form.value.lat;
    const lng = this.step1Form.value.lng;
    if (lat === null || lng === null || lat === undefined || lng === undefined || isNaN(Number(lat)) || isNaN(Number(lng))) {
      return null;
    }
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng) - 0.015},${Number(lat) - 0.015},${Number(lng) + 0.015},${Number(lat) + 0.015}&layer=mapnik&marker=${lat},${lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onStepChange(event: any): void {
    this.currentStepIndex.set(event.selectedIndex);
    
    // In Create mode, step 5 (index 4) generates credentials and creates the record automatically
    if (event.selectedIndex === 4 && !this.isEditMode() && !this.isCreated()) {
      this.generatePreviewCredentials();
      this.submitStore();
    }
  }

  generatePreviewCredentials(): void {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.tempPassword.set(`Binaara${randomHex}!`);
  }

  onFileSelect(event: Event, type: 'cr' | 'vat' | 'iban'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const fileName = input.files[0].name;
      if (type === 'cr') {
        this.crFile.set(fileName);
        this.step4Form.patchValue({ crUploaded: true });
      } else if (type === 'vat') {
        this.vatFile.set(fileName);
        this.step4Form.patchValue({ vatUploaded: true });
      } else if (type === 'iban') {
        this.ibanFile.set(fileName);
        this.step4Form.patchValue({ ibanUploaded: true });
      }
      this.toast.success(`${type.toUpperCase()} document auto-validated successfully!`);
    }
  }

  autoAttachMockDocs(): void {
    this.crFile.set('cr_registration_sample.pdf');
    this.vatFile.set('vat_certificate_sample.pdf');
    this.ibanFile.set('iban_bank_letter_sample.pdf');
    
    this.step4Form.patchValue({
      crUploaded: true,
      vatUploaded: true,
      ibanUploaded: true
    });
    this.toast.success('Mock Saudi files attached successfully for validation testing!');
  }

  submitStore(): void {
    if (this.step1Form.invalid || this.step2Form.invalid || this.step3Form.invalid || this.step4Form.invalid) {
      this.toast.error('Please resolve all validation errors before saving.');
      return;
    }

    this.loading.set(true);

    setTimeout(() => {
      const storeData = {
        name: this.step1Form.value.name!,
        location: this.step1Form.value.location!,
        district: this.step1Form.value.district!,
        lat: Number(this.step1Form.value.lat!),
        lng: Number(this.step1Form.value.lng!),
        storeLogo: this.step1Form.value.storeLogo || '',
        isActivated: !!this.step1Form.value.isActivated,
        status: this.isEditMode() 
          ? (this.step1Form.value.isActivated ? 'active' as const : 'pending' as const) 
          : 'pending' as const,
        crNumber: this.step2Form.value.crNumber!,
        vatNumber: this.step2Form.value.vatNumber!,
        iban: this.step2Form.value.iban!,
        ownerName: this.step3Form.value.ownerName!,
        ownerEmail: this.step3Form.value.ownerEmail!,
        ownerPhone: this.step3Form.value.ownerPhone!,
        ownerWhatsapp: this.step3Form.value.ownerWhatsapp!
      };

      // Attach uploaded mock documents in files model format
      const documents = [
        { type: 'cr' as const, fileName: this.crFile() || 'cr_sample.pdf', fileUrl: '/assets/mock-docs/cr_sample.pdf', status: 'approved' as const, uploadedAt: new Date().toISOString() },
        { type: 'vat' as const, fileName: this.vatFile() || 'vat_sample.pdf', fileUrl: '/assets/mock-docs/vat_sample.pdf', status: 'approved' as const, uploadedAt: new Date().toISOString() },
        { type: 'iban' as const, fileName: this.ibanFile() || 'iban_sample.pdf', fileUrl: '/assets/mock-docs/iban_sample.pdf', status: 'approved' as const, uploadedAt: new Date().toISOString() }
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
