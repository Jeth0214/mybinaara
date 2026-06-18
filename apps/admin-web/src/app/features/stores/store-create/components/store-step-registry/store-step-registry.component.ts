import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-store-step-registry',
  standalone: true,
  imports: [ReactiveFormsModule, MatStepperModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-step-registry.component.html'
})
export class StoreStepRegistryComponent {
  readonly form = input.required<FormGroup>();
  
  private readonly toast = inject(ToastService);

  copyToClipboard(text: string, label: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.toast.info(`${label} copied to clipboard!`);
    });
  }
}
