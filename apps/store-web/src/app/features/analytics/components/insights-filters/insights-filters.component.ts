import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-insights-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insights-filters.component.html',
  styleUrl: './insights-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsightsFiltersComponent {
  @Input() selectedDistance = '3 km';
  @Input() selectedPeriod = '30d';

  @Output() distanceChange = new EventEmitter<string>();
  @Output() periodChange = new EventEmitter<string>();

  distances = ['1 km', '3 km', '5 km', '10 km', '25 km'];
  periods = ['7d', '30d', '90d'];

  onDistanceChange(event: any): void {
    this.distanceChange.emit(event.target.value);
  }

  setPeriod(period: string): void {
    this.periodChange.emit(period);
  }
}
