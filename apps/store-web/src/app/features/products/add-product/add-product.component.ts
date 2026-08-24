import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, untracked, OnInit, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductUnitService } from '../../../core/services/product-unit.service';
import { ToastService } from '../../../core/services/toast.service';
import { MAX_PRODUCTS_PER_STORE, ProductStatus } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { ProductUnit } from '../../../core/models/product-unit.model';
import { CatalogProduct } from '../../../core/models/catalog-product.model';
import { ProductStatusBadgeComponent } from '../components/product-status-badge/product-status-badge.component';
import { CatalogProductPickerComponent } from '../../../shared/ui/catalog-product-picker/catalog-product-picker.component';

function comparePriceValidator(control: AbstractControl): ValidationErrors | null {
  const group = control.parent;
  if (!group) return null;

  const price = Number(group.get('price')?.value);
  const compareAtPrice = control.value;

  if (compareAtPrice === '' || compareAtPrice === null || compareAtPrice === undefined) {
    return null;
  }

  return Number(compareAtPrice) > price ? null : { gtPrice: true };
}

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ProductStatusBadgeComponent, CatalogProductPickerComponent],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProductComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private productUnitService = inject(ProductUnitService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sub = new Subscription();

  readonly maxProducts = MAX_PRODUCTS_PER_STORE;

  readonly categories = signal<Category[]>([]);
  readonly units = signal<ProductUnit[]>([]);

  readonly loading = signal(false);
  readonly fetching = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly productId = signal<number | null>(null);

  readonly productStatus = signal<ProductStatus | null>(null);
  readonly suspensionReason = signal<string | null>(null);
  readonly statusUpdating = signal(false);

  readonly selectedCatalogProduct = signal<CatalogProduct | null>(null);
  readonly catalogProductTouched = signal(false);
  readonly catalogPickerBusy = signal(false);

  productForm: FormGroup = this.fb.group({
    sku: ['', [Validators.maxLength(50)]],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    compare_at_price: [null as number | null, [comparePriceValidator]],
    stock_quantity: [0, [Validators.required, Validators.min(0)]],
  });

  private readonly formStatus = toSignal(this.productForm.statusChanges, { initialValue: this.productForm.status });
  readonly busy = computed(() => this.loading() || this.fetching() || this.catalogPickerBusy());
  readonly canSubmit = computed(
    () => !!this.selectedCatalogProduct() && this.formStatus() === 'VALID' && !this.busy()
  );

  constructor() {
    // Pricing/stock only make sense once a catalog product is chosen — keep them
    // disabled until then so the form can't be half-filled out of order.
    effect(() => {
      const isBusy = this.loading() || this.fetching();
      const hasCatalogProduct = !!this.selectedCatalogProduct();
      untracked(() => {
        if (isBusy) {
          this.productForm.disable({ emitEvent: false });
        } else {
          this.productForm.enable({ emitEvent: false });
          if (!hasCatalogProduct) {
            this.productForm.get('price')?.disable({ emitEvent: false });
            this.productForm.get('compare_at_price')?.disable({ emitEvent: false });
            this.productForm.get('stock_quantity')?.disable({ emitEvent: false });
          }
        }
      });
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.productId.set(+id);
      this.isEditMode.set(true);
      this.loadProductDetails(+id);
    }

    this.sub.add(
      this.productForm.get('price')?.valueChanges.subscribe(() => {
        this.productForm.get('compare_at_price')?.updateValueAndValidity({ emitEvent: false });
      })
    );

    this.loadDropdownOptions();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private loadDropdownOptions(): void {
    this.sub.add(
      forkJoin({
        categories: this.categoryService.listCategories({ is_active: true }),
        units: this.productUnitService.listActive(),
      }).subscribe({
        next: ({ categories, units }) => {
          this.categories.set(categories.data);
          this.units.set(units);
        },
        error: (err) => {
          this.toastService.error(err?.message || 'Failed to load categories/units.');
        },
      })
    );
  }

  private loadProductDetails(id: number): void {
    this.fetching.set(true);
    this.loadError.set(null);

    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.fetching.set(false);
        this.productForm.patchValue({
          sku: product.sku ?? '',
          price: product.price,
          compare_at_price: product.compare_at_price,
          stock_quantity: product.stock_quantity,
        });
        this.selectedCatalogProduct.set(product.catalog_product);
        this.productStatus.set(product.status);
        this.suspensionReason.set(product.suspension_reason);
      },
      error: (err) => {
        this.fetching.set(false);
        this.toastService.error(err?.message || 'Product not found.');
        this.router.navigate(['/products']);
      },
    });
  }

  onCatalogProductSelected(product: CatalogProduct): void {
    this.selectedCatalogProduct.set(product);
    this.catalogProductTouched.set(true);
  }

  onCatalogProductCleared(): void {
    this.selectedCatalogProduct.set(null);
  }

  /** Never reachable while suspended: the switch is hidden in that state,
   *  and the service's active/inactive-only signature makes it impossible to
   *  send anything else regardless. */
  onStatusToggle(): void {
    const current = this.productStatus();
    const id = this.productId();
    if (!id || !current || current === 'suspended' || this.statusUpdating()) return;

    const target = current === 'active' ? 'inactive' : 'active';

    this.statusUpdating.set(true);
    this.productService.updateProductStatus(id, target).subscribe({
      next: (updated) => {
        this.statusUpdating.set(false);
        this.productStatus.set(updated.status);
        this.toastService.success(`Product is now ${updated.status}.`);
      },
      error: (err) => {
        this.statusUpdating.set(false);
        this.toastService.error(err?.message || 'Failed to update product status.');
      },
    });
  }

  onSubmit(): void {
    this.catalogProductTouched.set(true);

    if (this.busy()) return;

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const catalogProduct = this.selectedCatalogProduct();
    if (!catalogProduct) return;

    const { sku, price, compare_at_price, stock_quantity } = this.productForm.getRawValue();

    const id = this.productId();
    const payload: Record<string, unknown> = {
      catalog_product_id: catalogProduct.id,
      price,
      stock_quantity,
      sku: sku || null,
      compare_at_price: compare_at_price === '' || compare_at_price === null ? null : compare_at_price,
    };

    this.loading.set(true);

    const request$ = id ? this.productService.updateProduct(id, payload) : this.productService.createProduct(payload);

    request$.subscribe({
      next: (product) => {
        this.loading.set(false);
        this.toastService.success(`${id ? 'Updated' : 'Listed'} "${product.catalog_product.name}" successfully.`);
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err?.message || `Failed to ${id ? 'update' : 'list'} product.`);
      },
    });
  }
}
