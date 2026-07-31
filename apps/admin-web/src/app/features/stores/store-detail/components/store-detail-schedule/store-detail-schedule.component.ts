import { ChangeDetectionStrategy, Component, inject, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SCHEDULE_DAYS, ScheduleDay, Store, StoreScheduleDay } from '../../../../../core/models/store.model';
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

  readonly days: Array<{ key: ScheduleDay; label: string }> = [
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
    const storeSchedule: StoreScheduleDay[] = s?.schedule?.length
      ? s.schedule
      : SCHEDULE_DAYS.map((day) => ({
          day,
          is_off: day === 'fri',
          open_time: day === 'fri' ? null : '08:00 AM',
          close_time: day === 'fri' ? null : '09:00 PM'
        }));

    this.scheduleForm = this.fb.group({
      workingHours: this.fb.group(
        this.days.reduce((acc, day) => {
          const matched = storeSchedule.find((item) => item.day === day.key) ?? {
            open_time: '08:00 AM',
            close_time: '09:00 PM',
            is_off: false
          };
          acc[day.key] = this.fb.group({
            openTime: [{ value: matched.open_time ?? '', disabled: matched.is_off }],
            closeTime: [{ value: matched.close_time ?? '', disabled: matched.is_off }],
            isOff: [matched.is_off]
          });
          return acc;
        }, {} as any)
      )
    });

    // Register checkbox change listeners to disable/enable timing dropdowns
    this.days.forEach((day) => {
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

    const workingHoursVal = this.scheduleForm.getRawValue().workingHours as Record<
      ScheduleDay,
      { openTime: string; closeTime: string; isOff: boolean }
    >;
    const scheduleArray: StoreScheduleDay[] = SCHEDULE_DAYS.map((day) => ({
      day,
      is_off: !!workingHoursVal[day]?.isOff,
      open_time: workingHoursVal[day]?.isOff ? null : workingHoursVal[day]?.openTime || null,
      close_time: workingHoursVal[day]?.isOff ? null : workingHoursVal[day]?.closeTime || null
    }));

    const s = this.store();
    if (!s) return;

    this.storeService.updateStoreSchedule(s.id, scheduleArray).subscribe({
      next: () => {
        this.toast.success('Store operations schedule updated successfully.');
        this.scheduleForm.markAsPristine();
      },
      error: (err) => {
        this.toast.error(err?.message ?? 'Failed to update schedule.');
      }
    });
  }
}
