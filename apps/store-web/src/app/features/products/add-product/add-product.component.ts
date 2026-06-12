import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { PRODUCT_CATEGORIES, CategoryInfo } from '../../../core/models/product.model';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProductComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Expose configuration and states
  readonly categories = PRODUCT_CATEGORIES;
  readonly isLimitReached = this.productService.isLimitReached;
  readonly productsLimit = this.productService.productsLimit;
  readonly currentUser = this.productService.currentUser;

  // Local state signals
  readonly loading = signal<boolean>(false);
  readonly fetching = signal<boolean>(false);
  readonly selectedImage = signal<string | null>(null);
  readonly isEditMode = signal<boolean>(false);
  productId?: string;

  productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    sku: [''],
    price: ['', [Validators.required, Validators.min(0.01)]],
    stock: ['', [Validators.required, Validators.min(0)]],
    category: ['', [Validators.required]],
    brand: ['', [Validators.required]],
    unit: ['per bag', [Validators.required]],
    status: ['Available', [Validators.required]],
    description: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.productId = id;
      this.isEditMode.set(true);
      this.loadProductDetails(id);
    }
  }

  private loadProductDetails(id: string): void {
    this.fetching.set(true);
    setTimeout(() => {
      const product = this.productService.products().find((p) => p.id === id);
      if (product) {
        this.productForm.patchValue({
          name: product.name,
          sku: product.sku || '',
          price: product.price,
          stock: product.stock,
          category: product.category,
          brand: product.brand || '',
          unit: product.unit || 'per bag',
          lowStockThreshold: product.lowStockThreshold ?? 20,
          status: product.status || 'Available',
          description: product.description || '',
        });
        if (product.imageUrl) {
          this.selectedImage.set(product.imageUrl);
        }
      } else {
        this.toastService.error('Product not found.');
        this.router.navigate(['/products']);
      }
      this.fetching.set(false);
    }, 500);
  }

  /**
   * Action when the category selector changes:
   * Dynamically sets a default category SVG icon as the preview image.
   */
  onCategoryChange(): void {
    const selectedCat = this.productForm.get('category')?.value;
    if (selectedCat) {
      const match = this.categories.find((c) => c.name === selectedCat);
      if (match) {
        this.selectedImage.set(match.iconPath);
      }
    }
  }

  removeSelectedImage(): void {
    this.selectedImage.set(null);
  }

  /**
   * Simulates a drag-and-drop or file upload and sets a mock image.
   */
  simulateUpload(): void {
    const selectedCat = this.productForm.get('category')?.value || 'Miscellaneous';
    const match = this.categories.find((c) => c.name === selectedCat) || this.categories[17];

    this.selectedImage.set(match.iconPath);
    this.toastService.success('Simulated file upload: Product photo applied successfully.');
  }

  onSubmit(): void {
    if (this.productForm.invalid || this.loading()) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const formVal = this.productForm.value;

    // Generate SKU if not present
    let skuVal = formVal.sku;
    if (!skuVal) {
      const storePrefix = this.currentUser()
        ? this.currentUser()!.storeName.toUpperCase().split(' ').map((w: string) => w[0]).join('').replace(/[^A-Z]/g, '')
        : 'MYB';
      const catAbbr = formVal.category ? formVal.category.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') : 'GEN';
      const prodAbbr = formVal.name ? formVal.name.toUpperCase().split(' ').slice(0, 2).map((w: string) => w[0]).join('').replace(/[^A-Z]/g, '') : 'ITM';
      const randNum = Math.floor(100 + Math.random() * 900);
      skuVal = `${storePrefix}-${catAbbr}-${prodAbbr || 'ITM'}-${randNum}`;
    }

    const productData = {
      name: formVal.name,
      sku: skuVal,
      price: Number(formVal.price),
      stock: Number(formVal.stock),
      category: formVal.category,
      brand: formVal.brand,
      unit: formVal.unit,
      lowStockThreshold: Number(formVal.lowStockThreshold),
      status: formVal.status,
      description: formVal.description,
      imageUrl: this.selectedImage() || undefined,
    };

    if (this.isEditMode() && this.productId) {
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: () => {
          this.toastService.success(`Updated "${productData.name}" successfully.`);
          this.loading.set(false);
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.toastService.error(err?.message || 'Failed to update product.');
          this.loading.set(false);
        },
      });
    } else {
      this.productService.addProduct(productData).subscribe({
        next: () => {
          this.toastService.success(`Listed "${productData.name}" in your catalog.`);
          this.loading.set(false);
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.toastService.error(err?.message || 'Failed to list product.');
          this.loading.set(false);
        },
      });
    }
  }
}
