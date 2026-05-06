import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoonComponent } from '../../../shared/ui/coming-soon/coming-soon.component';

@Component({
  selector: 'app-bulk-import',
  standalone: true,
  imports: [ComingSoonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-coming-soon
      title="Bulk Import"
      description="Upload a spreadsheet to add or update multiple products at once." />
  `,
})
export class BulkImportComponent {}
