import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-store-step-review',
  standalone: true,
  imports: [MatStepperModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-step-review.component.html'
})
export class StoreStepReviewComponent {
  readonly step1 = input.required<any>();
  readonly step2 = input.required<any>();
  readonly step3 = input.required<any>();
  readonly isCreated = input.required<boolean>();
  readonly submitting = input<boolean>(false);
  readonly createdOwnerEmail = input<string | null>(null);

  readonly submitStore = output<void>();
  readonly goToStoreList = output<void>();
}
