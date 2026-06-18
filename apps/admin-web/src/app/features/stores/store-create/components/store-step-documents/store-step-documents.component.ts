import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-store-step-documents',
  standalone: true,
  imports: [ReactiveFormsModule, MatStepperModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-step-documents.component.html'
})
export class StoreStepDocumentsComponent {
  readonly form = input.required<FormGroup>();
  readonly crFile = input.required<string | null>();
  readonly vatFile = input.required<string | null>();
  readonly ibanFile = input.required<string | null>();
  readonly isEditMode = input.required<boolean>();

  readonly fileSelect = output<{ event: Event, type: 'cr' | 'vat' | 'iban' }>();
  readonly autoAttach = output<void>();
  readonly submitStore = output<void>();
}
