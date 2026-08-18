import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { StoreLocation } from '../../../../../core/models/store.model';
import { StoreLocationPickerComponent } from './store-location-picker/store-location-picker.component';

@Component({
  selector: 'app-store-step-location-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatStepperModule, StoreLocationPickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-step-location-schedule.component.html',
  styleUrl: './store-step-location-schedule.component.scss'
})
export class StoreStepLocationScheduleComponent {
  readonly form = input.required<FormGroup>();
  readonly existingLocation = input<StoreLocation | null>(null);
  readonly isEditMode = input<boolean>(false);

  readonly showPicker = signal<boolean>(false);
  readonly draftLocation = signal<StoreLocation | null>(null);
  readonly lastCommitted = signal<StoreLocation | null>(null);
  readonly committedLocation = computed(() => (this.form().get('location') as FormGroup).value as StoreLocation);

  constructor() {
    // In edit mode the store's location arrives asynchronously (parent fetches
    // it over HTTP). Once it lands, auto-reveal the picker pre-filled with it.
    // Only ever flips `showPicker` to true here so it never fights a user who
    // already opened the picker manually, and it's safe whether this fires
    // before or after first render.
    effect(() => {
      const existing = this.existingLocation();
      if (existing && existing.latitude !== null && existing.longitude !== null) {
        this.showPicker.set(true);
        this.lastCommitted.set(existing);
      }
    });
  }

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

  onLocationChange(value: StoreLocation): void {
    this.draftLocation.set(value);
  }

  onSetLocation(): void {
    this.showPicker.set(true);
  }

  onSaveLocation(): void {
    const value = this.draftLocation();
    if (!value) return;
    (this.form().get('location') as FormGroup).patchValue(value);
    this.lastCommitted.set(value);
  }
}
