import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, OnDestroy } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { AddressService } from '../../../../../core/services/address.service';

@Component({
  selector: 'app-store-step-review',
  standalone: true,
  imports: [MatStepperModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-step-review.component.html'
})
export class StoreStepReviewComponent implements OnDestroy {
  private readonly addressService = inject(AddressService);

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

  readonly cityName = computed(() => {
    const cityId = this.step2()?.location?.city_id;
    if (!cityId) return null;

    return this.addressService.getCities().find((c) => c.city_id === cityId)?.name_en ?? null;
  });

  readonly districtName = computed(() => {
    const cityId = this.step2()?.location?.city_id;
    const districtId = this.step2()?.location?.district_id;
    if (!cityId || !districtId) return null;

    return this.addressService.getDistrictsByCity(cityId).find((d) => d.district_id === districtId)?.name_en ?? null;
  });

  readonly fullAddress = computed<string | null>(() => this.step2()?.location?.full_address || null);

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
