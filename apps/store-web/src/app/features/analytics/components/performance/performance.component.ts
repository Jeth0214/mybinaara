import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PerformanceProduct {
  name: string;
  impressions: number;
  change: number;
}

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceComponent {
  @Input() products: PerformanceProduct[] = [];
}
