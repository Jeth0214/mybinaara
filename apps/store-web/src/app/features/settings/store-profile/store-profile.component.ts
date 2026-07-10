import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { AuthState } from '../../../core/state/auth.state';

import { StoreInfoTabComponent } from './tabs/store-info-tab/store-info-tab.component';
import { StoreSecurityTabComponent } from './tabs/store-security-tab/store-security-tab.component';

@Component({
  selector: 'app-store-profile',
  standalone: true,
  imports: [
    CommonModule,
    StoreInfoTabComponent,
    StoreSecurityTabComponent
  ],
  templateUrl: './store-profile.component.html',
  styleUrl: './store-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreProfileComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sub = new Subscription();

  // Selected tab: 'info' | 'security'
  activeTab = 'info';

  // State Signals
  readonly errorMsg = this.store.selectSignal(AuthState.error);

  ngOnInit(): void {
    // Listen to query parameters to switch tabs
    this.sub.add(
      this.route.queryParams.subscribe((params) => {
        const tab = params['tab'];
        if (tab && ['info', 'security'].includes(tab)) {
          this.activeTab = tab;
        } else {
          this.activeTab = 'info';
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  setTab(tab: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }
}
