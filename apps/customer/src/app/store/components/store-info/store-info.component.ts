import { Component, input, computed } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Store } from '../../../core/models/store.model';

const DAY_CODES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

@Component({
  selector: 'app-store-info',
  templateUrl: './store-info.component.html',
  styleUrls: ['./store-info.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class StoreInfoComponent {
  store = input.required<Store>();
  distance = input<number | null>(null);

  todayHours = computed<string>(() => {
    const schedule = this.store().schedule;
    if (!schedule || schedule.length === 0) return 'Hours not available';

    const todayCode = DAY_CODES[new Date().getDay()];
    const today = schedule.find((d) => d.day === todayCode);
    if (!today || today.is_off) return 'Closed today';
    if (!today.open_time || !today.close_time) return 'Hours not available';

    // Already stored as "h:i A" (e.g. "8:00 AM") — the exact display format needed.
    return `${today.open_time} – ${today.close_time}`;
  });
}
