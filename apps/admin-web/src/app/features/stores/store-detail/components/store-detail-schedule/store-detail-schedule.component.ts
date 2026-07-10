import { ChangeDetectionStrategy, Component, inject, input, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store, StoreDaySchedule } from '../../../../../core/models/store.model';
import { StoreService } from '../../../../../core/services/store.service';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-store-detail-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-detail-schedule.component.html',
  styles: [`
    .fs-7-5 {
      font-size: 0.8rem;
    }
    .fs-8 {
      font-size: 0.72rem;
      letter-spacing: 0.02rem;
    }
  `]
})
export class StoreDetailScheduleComponent {
  private readonly fb = inject(FormBuilder);
  private readonly storeService = inject(StoreService);
  private readonly toast = inject(ToastService);

  readonly store = input.required<Store>();
  
  scheduleForm!: FormGroup;

  readonly days: Array<{ key: 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri'; label: string }> = [
    { key: 'sat', label: 'Saturday' },
    { key: 'sun', label: 'Sunday' },
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' },
  ];

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

  constructor() {
    effect(() => {
      // Re-initialize form when input store updates
      this.initForm();
    });
  }

  private initForm(): void {
    const s = this.store();
    const storeSchedule = s?.schedule || [
      { day: 'sat', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      { day: 'sun', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      { day: 'mon', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      { day: 'tue', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      { day: 'wed', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      { day: 'thu', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      { day: 'fri', openTime: '', closeTime: '', isOff: true }
    ];

    this.scheduleForm = this.fb.group({
      workingHours: this.fb.group(
        this.days.reduce((acc, day) => {
          const matched = storeSchedule.find(item => item.day === day.key) || { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false };
          acc[day.key] = this.fb.group({
            openTime: [{ value: matched.openTime, disabled: matched.isOff }],
            closeTime: [{ value: matched.closeTime, disabled: matched.isOff }],
            isOff: [matched.isOff]
          });
          return acc;
        }, {} as any)
      )
    });

    // Register checkbox change listeners to disable/enable timing dropdowns
    this.days.forEach(day => {
      const dayGroup = this.scheduleForm.get(`workingHours.${day.key}`) as FormGroup;
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

  onSave(): void {
    if (this.scheduleForm.invalid) return;

    const workingHoursVal = this.scheduleForm.getRawValue().workingHours as any;
    const scheduleArray: StoreDaySchedule[] = Object.keys(workingHoursVal || {}).map(day => ({
      day: day as any,
      openTime: workingHoursVal[day]?.openTime || '',
      closeTime: workingHoursVal[day]?.closeTime || '',
      isOff: !!workingHoursVal[day]?.isOff
    }));

    const s = this.store();
    if (s) {
      this.storeService.updateStore(s.id, { schedule: scheduleArray });
      this.toast.success('Store operations schedule updated successfully.');
      this.scheduleForm.markAsPristine();
    }
  }
}
