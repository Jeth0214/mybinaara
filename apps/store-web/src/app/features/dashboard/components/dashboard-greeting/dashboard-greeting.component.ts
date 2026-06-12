import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreUser } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-dashboard-greeting',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-greeting.component.html',
  styleUrl: './dashboard-greeting.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardGreetingComponent {
  user = input<StoreUser | null>(null);

  readonly greetingText = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    } else if (hour < 17) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  });

  readonly greetingIcon = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'bi-brightness-alt-high-fill';
    } else if (hour < 17) {
      return 'bi-sun-fill';
    } else {
      return 'bi-moon-stars-fill';
    }
  });

  readonly todaySchedule = computed(() => {
    const currentUser = this.user();
    if (!currentUser || !currentUser.workingHours) {
      return { status: 'unconfigured', text: 'Working hours not configured' };
    }

    const daysMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const currentDayIndex = new Date().getDay();
    const dayKey = daysMap[currentDayIndex] as keyof typeof currentUser.workingHours;
    const schedule = currentUser.workingHours[dayKey];

    if (!schedule || schedule.isOff) {
      return { status: 'closed', text: 'Scheduled as closed today' };
    }

    if (schedule.openTime && schedule.closeTime) {
      return {
        status: 'open',
        text: `Scheduled open: ${schedule.openTime} - ${schedule.closeTime}`,
      };
    }

    return { status: 'unconfigured', text: 'Working hours not configured' };
  });
}
