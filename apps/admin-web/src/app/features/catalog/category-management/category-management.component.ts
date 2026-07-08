import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserCatalogService } from '../../../core/services/user-catalog.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/catalog.model';
import { StoreConfirmModalComponent } from '../../stores/components/store-confirm-modal/store-confirm-modal.component';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, RouterLink, NgbDropdownModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.scss'
})
export class CategoryManagementComponent {
  private readonly userCatalogService = inject(UserCatalogService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);

  readonly categories = this.userCatalogService.categories;

  deleteCategory(category: Category): void {
    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set('Delete Category');
    modalRef.componentInstance.message.set(
      `Are you sure you want to delete <strong>${category.name}</strong>?<br>This action cannot be undone.`
    );
    modalRef.componentInstance.confirmText.set('Delete Category');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(true);

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.userCatalogService.deleteCategory(category.id);
          this.toast.success(`Category "${category.name}" has been deleted successfully.`);
        }
      },
      () => {}
    );
  }
}
