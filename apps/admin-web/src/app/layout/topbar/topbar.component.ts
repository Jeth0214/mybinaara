import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  /** Signal inputs */
  readonly expanded = input(true);
  readonly mobileOpen = input(false);

  /** Signal outputs */
  readonly toggleSidebar = output<void>();
  readonly openMobile = output<void>();
  readonly closeMobile = output<void>();

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly currentDate = computed(() =>
    new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );

  readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.getDeepestData('title')),
      startWith(this.getDeepestData('title'))
    ),
    { initialValue: '' }
  );

  readonly pageIcon = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.getDeepestData('icon')),
      startWith(this.getDeepestData('icon'))
    ),
    { initialValue: '' }
  );

  private getDeepestData(key: string): string {
    let route = this.activatedRoute.snapshot;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return (route.data?.[key] as string) ?? '';
  }
}
