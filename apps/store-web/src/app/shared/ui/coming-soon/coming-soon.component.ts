import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text-center py-5 mt-5">
      <i class="bi bi-hammer fs-1 text-muted mb-3 d-block"></i>
      <h2 class="fw-semibold mb-2">{{ title }}</h2>
      <p class="text-muted mb-0">{{ description }}</p>
    </div>
  `,
})
export class ComingSoonComponent {
  @Input() title = 'Coming Soon';
  @Input() description = '';
}
