import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, OnDestroy } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-store-step-review',
  standalone: true,
  imports: [MatStepperModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-step-review.component.html'
})
export class StoreStepReviewComponent implements OnDestroy {
  readonly step1 = input.required<any>();
  readonly step2 = input.required<any>();
  readonly step3 = input.required<any>();
  readonly isCreated = input.required<boolean>();
  readonly submitting = input<boolean>(false);
  readonly createdOwnerEmail = input<string | null>(null);

  readonly submitStore = output<void>();
  readonly goToStoreList = output<void>();

  /** Local preview of the Step 1 logo file, built via object URL — revoked whenever the file changes or the component is destroyed. */
  readonly logoPreviewUrl = signal<string | null>(null);
  private previousObjectUrl: string | null = null;

  readonly city = computed<string | null>(() => this.step2()?.location?.city || null);

  readonly formattedAddress = computed<string | null>(() => this.step2()?.location?.formatted_address || null);

  constructor() {
    effect(() => {
      const file = this.step1()?.logo as File | null;
      this.revokePreviousObjectUrl();

      if (file) {
        const url = URL.createObjectURL(file);
        this.previousObjectUrl = url;
        this.logoPreviewUrl.set(url);
      } else {
        this.logoPreviewUrl.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.revokePreviousObjectUrl();
  }

  private revokePreviousObjectUrl(): void {
    if (this.previousObjectUrl) {
      URL.revokeObjectURL(this.previousObjectUrl);
      this.previousObjectUrl = null;
    }
  }
}
