import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecentStore } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-recent-stores',
  standalone: true,
  imports: [DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recent-stores.component.html',
  styleUrl: './recent-stores.component.scss',
})
export class RecentStoresComponent {
  readonly stores = input<RecentStore[]>([]);
}
