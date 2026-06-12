import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-import-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './import-success.component.html',
  styleUrl: './import-success.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportSuccessComponent {
  @Input() readyCount = 0;

  @Output() importAnother = new EventEmitter<void>();

  onImportAnother(): void {
    this.importAnother.emit();
  }
}
