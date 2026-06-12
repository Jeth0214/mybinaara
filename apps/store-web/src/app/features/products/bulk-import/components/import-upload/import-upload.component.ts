import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-import-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-upload.component.html',
  styleUrl: './import-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportUploadComponent {
  @Input() loading = false;

  @Output() fileSelected = new EventEmitter<any>();
  @Output() templateDownload = new EventEmitter<void>();

  onFileSelected(event: any): void {
    this.fileSelected.emit(event);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.fileSelected.emit({ target: { files } });
    }
  }

  triggerDownload(): void {
    this.templateDownload.emit();
  }
}
