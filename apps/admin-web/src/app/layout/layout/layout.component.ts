import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit, OnDestroy {
  private readonly breakpoints = inject(BreakpointObserver);
  private sub!: Subscription;

  /** true = full sidebar (icons + labels); false = icons-only */
  readonly sidebarExpanded = signal(true);

  /** mobile overlay open */
  readonly mobileOpen = signal(false);

  ngOnInit(): void {
    this.sub = this.breakpoints
      .observe([Breakpoints.XLarge, Breakpoints.Large, Breakpoints.Medium])
      .subscribe(() => {
        const isDesktop = this.breakpoints.isMatched('(min-width: 1200px)');
        const isTablet =
          this.breakpoints.isMatched('(min-width: 768px)') && !isDesktop;

        if (isDesktop) {
          this.sidebarExpanded.set(true);
          this.mobileOpen.set(false);
        } else if (isTablet) {
          this.sidebarExpanded.set(false);
          this.mobileOpen.set(false);
        } else {
          this.sidebarExpanded.set(true);
          this.mobileOpen.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarExpanded.update((v) => !v);
  }

  openMobile(): void {
    this.mobileOpen.set(true);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
