import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-store-step-registry',
  standalone: true,
  imports: [ReactiveFormsModule, MatStepperModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-step-registry.component.html'
})
export class StoreStepRegistryComponent {
  readonly form = input.required<FormGroup>();
  readonly isEditMode = input.required<boolean>();
  readonly submitting = input<boolean>(false);

  readonly submitStore = output<void>();
}
