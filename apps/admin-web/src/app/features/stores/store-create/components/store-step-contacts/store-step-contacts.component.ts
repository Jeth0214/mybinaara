import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-store-step-contacts',
  standalone: true,
  imports: [ReactiveFormsModule, MatStepperModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-step-contacts.component.html'
})
export class StoreStepContactsComponent {
  readonly form = input.required<FormGroup>();
}
