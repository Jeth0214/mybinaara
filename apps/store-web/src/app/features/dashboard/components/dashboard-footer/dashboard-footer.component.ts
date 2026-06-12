import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-footer.component.html',
  styleUrl: './dashboard-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardFooterComponent {
  readonly currentYear = new Date().getFullYear();
}
