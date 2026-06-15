import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../../../core/services/store.service';
import { ToastService } from '../../../core/services/toast.service';
import { SAUDI_CITIES, STORE_CATEGORIES } from '../../../core/models/store.model';

@Component({
  selector: 'app-store-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-create.component.html',
  styleUrl: './store-create.component.scss'
})
export class StoreCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly storeService = inject(StoreService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly cities = SAUDI_CITIES;
  readonly categories = STORE_CATEGORIES;

  // Wizard Navigation Signal
  readonly currentStep = signal(1);

  // Generated Credentials Signals
  readonly tempPassword = signal('');
  readonly activationLink = signal('');
  readonly isCreated = signal(false);

  // Reactive Forms grouped by Step
  readonly step1Form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', Validators.required],
    location: ['', Validators.required]
  });

  readonly step2Form = this.fb.group({
    crNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // Saudi CR is 10 digits
    vatNumber: ['', [Validators.required, Validators.pattern('^3[0-9]{14}$')]], // Saudi VAT is 15 digits starting with 3
    iban: ['', [Validators.required, Validators.pattern('^SA[0-9]{22}$')]] // Saudi IBAN starts with SA, followed by 22 digits
  });

  readonly step3Form = this.fb.group({
    ownerName: ['', [Validators.required, Validators.minLength(3)]],
    ownerEmail: ['', [Validators.required, Validators.email]],
    ownerPhone: ['', [Validators.required, Validators.pattern('^(?:\\+966|0)?5[0-9]{8}$')]] // Saudi mobile prefix 05 or +9665
  });

  nextStep(): void {
    if (this.currentStep() === 1) {
      if (this.step1Form.invalid) {
        this.step1Form.markAllAsTouched();
        return;
      }
      this.currentStep.set(2);
    } else if (this.currentStep() === 2) {
      if (this.step2Form.invalid) {
        this.step2Form.markAllAsTouched();
        return;
      }
      this.currentStep.set(3);
    } else if (this.currentStep() === 3) {
      if (this.step3Form.invalid) {
        this.step3Form.markAllAsTouched();
        return;
      }
      // Prepare preview step, auto-generate credentials beforehand
      this.generatePreviewCredentials();
      this.currentStep.set(4);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1 && !this.isCreated()) {
      this.currentStep.update(s => s - 1);
    }
  }

  generatePreviewCredentials(): void {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.tempPassword.set(`Binaara${randomHex}!`);
    
    const storeShort = this.step1Form.value.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'vendor';
    this.activationLink.set(`https://mybinaara.com/activate/${storeShort}-${Math.random().toString(36).substring(2, 6)}`);
  }

  submitStore(): void {
    if (this.step1Form.invalid || this.step2Form.invalid || this.step3Form.invalid) {
      this.toast.error('Please fix form validation errors before submitting.');
      return;
    }

    const newStoreData = {
      name: this.step1Form.value.name!,
      category: this.step1Form.value.category!,
      location: this.step1Form.value.location!,
      crNumber: this.step2Form.value.crNumber!,
      vatNumber: this.step2Form.value.vatNumber!,
      iban: this.step2Form.value.iban!,
      ownerName: this.step3Form.value.ownerName!,
      ownerEmail: this.step3Form.value.ownerEmail!,
      ownerPhone: this.step3Form.value.ownerPhone!,
      tempPassword: this.tempPassword(),
      activationLink: this.activationLink()
    };

    try {
      this.storeService.createStore(newStoreData);
      this.isCreated.set(true);
      this.toast.success(`Store "${newStoreData.name}" created. Activation credentials generated!`);
    } catch (err) {
      this.toast.error('An error occurred while creating the store.');
    }
  }

  copyToClipboard(text: string, label: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.toast.info(`${label} copied to clipboard!`);
    });
  }

  resetAndExit(): void {
    this.router.navigate(['/stores']);
  }
}
