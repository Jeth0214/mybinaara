import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { UserCatalogService } from '../../../core/services/user-catalog.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/catalog.model';
import { StoreConfirmModalComponent } from '../../stores/components/store-confirm-modal/store-confirm-modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgbDropdownModule, MatPaginatorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {
  private readonly userCatalogService = inject(UserCatalogService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);

  readonly searchQuery = signal('');
  readonly categoryFilter = signal('all');
  readonly statusFilter = signal('all');

  // Pagination Signals
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);

  readonly categories = this.userCatalogService.categories;
  readonly allProducts = this.userCatalogService.products;

  constructor() {
    // Reset page index on filter change
    effect(() => {
      this.searchQuery();
      this.categoryFilter();
      this.statusFilter();

      untracked(() => {
        this.pageIndex.set(0);
      });
    });
  }

  readonly filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.categoryFilter();
    const status = this.statusFilter();

    return this.allProducts().filter(prod => {
      const matchesSearch = !query ||
        prod.name.toLowerCase().includes(query) ||
        prod.sku.toLowerCase().includes(query) ||
        prod.brand.toLowerCase().includes(query) ||
        prod.storeName.toLowerCase().includes(query);

      const matchesCategory = category === 'all' || prod.category === category;
      const matchesStatus = status === 'all' ||
        (status === 'suspended' ? prod.isSuspended : !prod.isSuspended);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  });

  readonly paginatedProducts = computed(() => {
    const list = this.filteredProducts();
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return list.slice(start, end);
  });

  handlePageEvent(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }

  deleteProduct(product: Product): void {
    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set('Delete Product');
    modalRef.componentInstance.message.set(
      `Are you sure you want to delete <strong>${product.name}</strong>?<br>This action cannot be undone.`
    );
    modalRef.componentInstance.confirmText.set('Delete Product');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(true);

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.userCatalogService.deleteProduct(product.id);
          this.toast.success(`Product "${product.name}" has been deleted successfully.`);
        }
      },
      () => {}
    );
  }
}
