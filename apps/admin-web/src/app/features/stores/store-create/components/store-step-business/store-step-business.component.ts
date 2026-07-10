import { ChangeDetectionStrategy, Component, inject, input, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-store-step-business',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatStepperModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-step-business.component.html',
  styleUrl: './store-step-business.component.scss'
})
export class StoreStepBusinessComponent {
  readonly form = input.required<FormGroup>();
  readonly isEditMode = input<boolean>(false);
  readonly isPendingAccount = input<boolean>(false);

  private readonly cdr = inject(ChangeDetectorRef);

  readonly logoError = signal<string | null>(null);
  readonly logoUploading = signal<boolean>(false);

  onLogoFileSelect(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (!inputEl.files || inputEl.files.length === 0) return;

    const file = inputEl.files[0];
    const control = this.form().get('storeLogo');

    this.logoError.set(null);
    this.logoUploading.set(true);

    if (!file.type.startsWith('image/')) {
      this.logoError.set('Only image files (PNG, JPG, JPEG, WEBP) are allowed.');
      control?.setValue('');
      control?.setErrors({ invalidType: true });
      this.logoUploading.set(false);
      this.cdr.markForCheck();
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.logoError.set('File size exceeds 2MB limit. Please upload a smaller image.');
      control?.setValue('');
      control?.setErrors({ maxSize: true });
      this.logoUploading.set(false);
      this.cdr.markForCheck();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        if (width < 200 || height < 200) {
          this.logoError.set(`Image dimensions are too small (${width}x${height}px). Minimum size is 200x200px.`);
          control?.setValue('');
          control?.setErrors({ minDimensions: true });
          this.logoUploading.set(false);
          this.cdr.markForCheck();
          return;
        }

        const ratio = width / height;
        if (ratio < 0.8 || ratio > 1.25) {
          this.logoError.set(`Image is not approximately square (current size: ${width}x${height}px).`);
          control?.setValue('');
          control?.setErrors({ aspectRatio: true });
          this.logoUploading.set(false);
          this.cdr.markForCheck();
          return;
        }

        setTimeout(() => {
          this.logoError.set(null);
          control?.setValue(e.target.result);
          control?.setErrors(null);
          control?.markAsTouched();
          control?.updateValueAndValidity();
          this.logoUploading.set(false);
          this.cdr.markForCheck();
        }, 1200);
      };
      img.onerror = () => {
        this.logoError.set('Failed to read image file content.');
        control?.setValue('');
        control?.setErrors({ invalidImage: true });
        this.logoUploading.set(false);
        this.cdr.markForCheck();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  fillTestingContacts(): void {
    this.form().patchValue({
      ownerName: 'Mohammed Al-Fozan',
      ownerEmail: 'mohammed@fozan.com.sa',
      ownerPhone: '+966505123456',
      ownerWhatsapp: '+966505123456'
    });
  }
}
