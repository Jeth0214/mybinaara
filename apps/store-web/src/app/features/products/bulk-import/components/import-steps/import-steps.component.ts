import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-import-steps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-steps.component.html',
  styleUrl: './import-steps.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportStepsComponent {
  @Input() currentStep = 1;
}
