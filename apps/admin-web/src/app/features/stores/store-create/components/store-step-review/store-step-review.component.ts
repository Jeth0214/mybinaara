import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { ToastService } from '../../../../../core/services/toast.service';

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
  readonly tempPassword = input.required<string>();
  readonly isCreated = input.required<boolean>();
  readonly isNotified = input.required<boolean>();

  readonly submitStore = output<void>();
  readonly notifyMerchant = output<void>();
  readonly resetAndExit = output<void>();

  private readonly toast = inject(ToastService);

  copyToClipboard(text: string, label: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.toast.info(`${label} copied to clipboard!`);
    });
  }
}
