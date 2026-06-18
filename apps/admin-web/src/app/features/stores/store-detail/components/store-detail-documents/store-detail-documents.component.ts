import { ChangeDetectionStrategy, Component, input, model, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store, DocumentType, StoreDocument } from '../../../../../core/models/store.model';

@Component({
  selector: 'app-store-detail-documents',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-detail-documents.component.html',
  styleUrl: './store-detail-documents.component.scss'
})
export class StoreDetailDocumentsComponent {
  readonly store = input.required<Store>();
  readonly selectedDocType = model.required<DocumentType>();

  readonly approve = output<DocumentType>();
  readonly reject = output<DocumentType>();

  readonly currentDocument = computed(() => {
    const s = this.store();
    const type = this.selectedDocType();
    return s.documents.find((d: StoreDocument) => d.type === type) || null;
  });

  selectDoc(type: DocumentType): void {
    this.selectedDocType.set(type);
  }
}
