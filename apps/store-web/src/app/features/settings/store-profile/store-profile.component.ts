import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { AuthState } from '../../../core/state/auth.state';

import { StoreInfoTabComponent } from './tabs/store-info-tab/store-info-tab.component';

@Component({
  selector: 'app-store-profile',
  standalone: true,
  imports: [
    CommonModule,
    StoreInfoTabComponent,
  ],
  templateUrl: './store-profile.component.html',
  styleUrl: './store-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreProfileComponent {
  private store = inject(Store);

  // State Signals
  readonly errorMsg = this.store.selectSignal(AuthState.error);
}
