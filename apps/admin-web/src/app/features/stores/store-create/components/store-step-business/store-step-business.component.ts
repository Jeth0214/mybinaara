import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CityOption } from '../../../../../core/models/store.model';
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
  readonly cities = input.required<CityOption[]>();
  readonly isEditMode = input<boolean>(false);
  readonly isPendingAccount = input<boolean>(false);

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

  
  private readonly sanitizer = inject(DomSanitizer);

  readonly logoError = signal<string | null>(null);
  readonly logoUploading = signal<boolean>(false);

  getMapUrl(): SafeResourceUrl | null {
    const formGroup = this.form();
    const lat = formGroup.value.lat;
    const lng = formGroup.value.lng;
    if (lat === null || lng === null || lat === undefined || lng === undefined || isNaN(Number(lat)) || isNaN(Number(lng))) {
      return null;
    }
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng) - 0.015},${Number(lat) - 0.015},${Number(lng) + 0.015},${Number(lat) + 0.015}&layer=mapnik&marker=${lat},${lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onLogoFileSelect(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (!inputEl.files || inputEl.files.length === 0) return;

    const file = inputEl.files[0];
    const control = this.form().get('storeLogo');

    this.logoError.set(null);
    this.logoUploading.set(true);

    // 1. Validate File Type
    if (!file.type.startsWith('image/')) {
      this.logoError.set('Only image files (PNG, JPG, JPEG, WEBP) are allowed.');
      control?.setValue('');
      control?.setErrors({ invalidType: true });
      this.logoUploading.set(false);
      return;
    }

    // 2. Validate File Size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      this.logoError.set('File size exceeds 2MB limit. Please upload a smaller image.');
      control?.setValue('');
      control?.setErrors({ maxSize: true });
      this.logoUploading.set(false);
      return;
    }

    // 3. Validate Image Dimensions (min 200x200px and square-ish aspect ratio)
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
          return;
        }

        const ratio = width / height;
        if (ratio < 0.8 || ratio > 1.25) {
          this.logoError.set(`Image is not approximately square (current size: ${width}x${height}px).`);
          control?.setValue('');
          control?.setErrors({ aspectRatio: true });
          this.logoUploading.set(false);
          return;
        }

        // Simulate network upload
        setTimeout(() => {
          this.logoError.set(null);
          control?.setValue(e.target.result);
          control?.setErrors(null);
          control?.markAsTouched();
          control?.updateValueAndValidity();
          this.logoUploading.set(false);
        }, 1200);
      };
      img.onerror = () => {
        this.logoError.set('Failed to read image file content.');
        control?.setValue('');
        control?.setErrors({ invalidImage: true });
        this.logoUploading.set(false);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

}
