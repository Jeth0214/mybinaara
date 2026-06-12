import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { Product, PRODUCT_CATEGORIES } from '../../core/models/product.model';
import { ProductDetailsModalComponent } from './components/product-details-modal/product-details-modal.component';
import { QuickStockModalComponent } from './components/quick-stock-modal/quick-stock-modal.component';
import { DeleteConfirmModalComponent } from './components/delete-confirm-modal/delete-confirm-modal.component';
import { StatusConfirmModalComponent } from './components/status-confirm-modal/status-confirm-modal.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, NgbModalModule, NgbDropdownModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  readonly productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private modalService = inject(NgbModal);
  private toastService = inject(ToastService);

  readonly categories = PRODUCT_CATEGORIES;

  // Filter signals
  readonly searchText = signal<string>('');
  readonly selectedCategory = signal<string>('All');
  readonly selectedStockStatus = signal<string>('All');


  // Computed dynamic stats from ProductService
  readonly isLimitReached = this.productService.isLimitReached;
  readonly productsCount = this.productService.productsCount;
  readonly productsLimit = this.productService.productsLimit;
  readonly progressPercent = this.productService.progressPercent;
  readonly slotsRemaining = this.productService.slotsRemaining;
  readonly inStockCount = this.productService.inStockCount;
  readonly lowStockCount = this.productService.lowStockCount;
  readonly outOfStockCount = this.productService.outOfStockCount;

  // Live filter computation using signals
  readonly filteredProducts = computed(() => {
    const query = this.searchText().toLowerCase().trim();
    const cat = this.selectedCategory();
    const stock = this.selectedStockStatus();

    return this.productService.products().filter((p) => {
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query);

      const matchesCategory = cat === 'All' || p.category === cat;

      let matchesStock = true;
      if (stock === 'InStock') {
        matchesStock = p.stock > 10;
      } else if (stock === 'LowStock') {
        matchesStock = p.stock > 0 && p.stock <= 10;
      } else if (stock === 'OutOfStock') {
        matchesStock = p.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  });

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value);
  }

  onStockStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedStockStatus.set(value);
  }

  resetFilters(): void {
    this.searchText.set('');
    this.selectedCategory.set('All');
    this.selectedStockStatus.set('All');
  }

  getCategoryIcon(categoryName: string): string {
    const cat = this.categories.find((c) => c.name === categoryName);
    return cat ? cat.iconPath : 'images/category-icons/miscellaneous.svg';
  }

  getCategoryClass(categoryName: string): string {
    switch (categoryName) {
      case 'Cement & Blocks':
        return 'cat-cement';
      case 'Steel & Metal':
        return 'cat-steel';
      case 'Electrical':
        return 'cat-electrical';
      case 'Plumbing':
        return 'cat-plumbing';
      default:
        return '';
    }
  }

  readonly subscriptionPlan = computed(() => this.productService.currentUser()?.subscriptionPlan || 'Free');

  readonly bottomAlertText = computed(() => {
    const plan = this.subscriptionPlan();
    if (plan === 'Free') {
      return "You're on the Free plan — limited to 5 products. Upgrade to Pro for 50 products or Business for 100.";
    } else if (plan === 'Pro') {
      return "You're on the Pro plan — limited to 50 products. Upgrade to Enterprise for 100 products.";
    } else {
      return "You're on the Enterprise plan — limited to 100 products. Contact support if you need more slots.";
    }
  });

  getProductSubtext(product: Product): string {
    let brand = 'Local Brand';
    const nameLower = product.name.toLowerCase();
    if (nameLower.includes('al-saqr') || nameLower.includes('cement')) {
      brand = 'Al-Saqr Brand';
    } else if (nameLower.includes('swiftbuild') || nameLower.includes('screwdriver') || nameLower.includes('tool')) {
      brand = 'SwiftBuild';
    } else if (nameLower.includes('al-amal')) {
      brand = 'Al-Amal Brand';
    } else if (nameLower.includes('yamama')) {
      brand = 'Yamama Brand';
    }
    
    let category = product.category;
    if (category === 'Cement & Blocks') {
      category = 'Cement';
    } else if (category === 'Tools & Hardware') {
      category = 'Power tools';
    }
    
    return `${category} · ${brand}`;
  }

  getProductUnit(product: Product): string {
    const name = product.name.toLowerCase();
    const cat = product.category.toLowerCase();
    if (name.includes('bag') || cat.includes('cement')) {
      return 'bag';
    }
    if (name.includes('rebar') || cat.includes('steel') || cat.includes('metal')) {
      return 'ton';
    }
    return 'unit';
  }

  // --- Status Toggle Confirmation Modal ---
  onStatusToggle(product: Product, event: Event): void {
    event.preventDefault();
    const modalRef = this.modalService.open(StatusConfirmModalComponent, { centered: true });
    modalRef.componentInstance.product = product;
  }

  // --- View Details Modal ---
  openViewDetailsModal(product: Product): void {
    const modalRef = this.modalService.open(ProductDetailsModalComponent, { centered: true, size: 'md' });
    modalRef.componentInstance.product = product;
  }

  // --- Quick Stock Update Modal ---
  openQuickStockModal(product: Product): void {
    const modalRef = this.modalService.open(QuickStockModalComponent, { centered: true });
    modalRef.componentInstance.product = product;
  }

  // --- Delete Modal ---
  openDeleteConfirmModal(product: Product): void {
    const modalRef = this.modalService.open(DeleteConfirmModalComponent, { centered: true });
    modalRef.componentInstance.product = product;
  }
}
