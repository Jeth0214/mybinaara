import { ChangeDetectionStrategy, Component, input, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';

const ACCEPTED_LOGO_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_LOGO_SIZE = 2 * 1024 * 1024;

@Component({
  selector: 'app-store-step-business',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatStepperModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-step-business.component.html',
  styleUrl: './store-step-business.component.scss'
})
export class StoreStepBusinessComponent implements OnDestroy {
  readonly form = input.required<FormGroup>();
  readonly isEditMode = input<boolean>(false);
  readonly existingLogoUrl = input<string | null>(null);
  readonly canEditOwner = input<boolean>(true);

  readonly logoError = signal<string | null>(null);
  readonly logoPreviewUrl = signal<string | null>(null);
  private objectUrl: string | null = null;

  currentLogoPreview(): string | null {
    return this.logoPreviewUrl() ?? this.existingLogoUrl();
  }

  onLogoFileSelect(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (!inputEl.files || inputEl.files.length === 0) return;

    const file = inputEl.files[0];
    this.logoError.set(null);

    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      this.logoError.set('Only JPG, PNG, or WEBP images are allowed.');
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      this.logoError.set('File size exceeds 2MB limit. Please upload a smaller image.');
      return;
    }

    this.revokeObjectUrl();
    this.objectUrl = URL.createObjectURL(file);
    this.logoPreviewUrl.set(this.objectUrl);
    this.form().get('logo')?.setValue(file);
    this.form().get('removeLogo')?.setValue(false);
    inputEl.value = '';
  }

  removeLogo(): void {
    this.revokeObjectUrl();
    this.logoPreviewUrl.set(null);
    this.logoError.set(null);
    this.form().get('logo')?.setValue(null);
    this.form().get('removeLogo')?.setValue(true);
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }
}
