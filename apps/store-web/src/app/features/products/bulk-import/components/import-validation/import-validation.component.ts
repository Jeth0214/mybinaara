import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportRow } from '../../bulk-import.component';

@Component({
  selector: 'app-import-validation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-validation.component.html',
  styleUrl: './import-validation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportValidationComponent {
  @Input() selectedFileName: string | null = null;
  @Input() importRows: ImportRow[] = [];
  @Input() readyCount = 0;
  @Input() warningsCount = 0;
  @Input() errorsCount = 0;
  @Input() loading = false;

  @Output() fixErrors = new EventEmitter<void>();
  @Output() confirmImport = new EventEmitter<void>();

  onFixErrors(): void {
    this.fixErrors.emit();
  }

  onConfirmImport(): void {
    this.confirmImport.emit();
  }
}
