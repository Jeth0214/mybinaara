import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, untracked, OnInit, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { StoreService } from '../../../core/services/store.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductUnitService } from '../../../core/services/product-unit.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';
import { Store as StoreRecord } from '../../../core/models/store.model';
import { Category } from '../../../core/models/category.model';
import { ProductUnit } from '../../../core/models/product-unit.model';
import { CatalogProduct } from '../../../core/models/catalog-product.model';
import { CatalogProductPickerComponent } from '../components/catalog-product-picker/catalog-product-picker.component';

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
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, CatalogProductPickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly storeService = inject(StoreService);
  private readonly categoryService = inject(CategoryService);
  private readonly productUnitService = inject(ProductUnitService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private sub = new Subscription();

  readonly productId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.productId());

  readonly loadedProduct = signal<Product | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly busy = computed(() => this.loading() || this.submitting() || this.catalogPickerBusy());

  readonly stores = signal<StoreRecord[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly units = signal<ProductUnit[]>([]);

  readonly selectedCatalogProduct = signal<CatalogProduct | null>(null);
  readonly catalogProductTouched = signal(false);
  readonly catalogPickerBusy = signal(false);

  readonly form = this.fb.group({
    store_id: [null as number | null, [Validators.required]],
    sku: ['', [Validators.maxLength(50)]],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    compare_at_price: [null as number | null, [comparePriceValidator]],
    stock_quantity: [0, [Validators.required, Validators.min(0)]],
  });

  private readonly formStatus = toSignal(this.form.statusChanges, { initialValue: this.form.status });
  readonly canSubmit = computed(
    () => !!this.selectedCatalogProduct() && this.formStatus() === 'VALID' && !this.busy()
  );

  constructor() {
    // Pricing/stock only make sense once a catalog product is chosen — keep them
    // disabled until then so the form can't be half-filled out of order.
    effect(() => {
      const isBusy = this.busy();
      const hasCatalogProduct = !!this.selectedCatalogProduct();
      untracked(() => {
        if (isBusy) {
          this.form.disable({ emitEvent: false });
        } else {
          this.form.enable({ emitEvent: false });
          if (this.isEditMode()) {
            this.form.get('store_id')?.disable({ emitEvent: false });
          }
          if (!hasCatalogProduct) {
            this.form.get('price')?.disable({ emitEvent: false });
            this.form.get('compare_at_price')?.disable({ emitEvent: false });
            this.form.get('stock_quantity')?.disable({ emitEvent: false });
          }
        }
      });
    });

    // Patch the form once the fetched product becomes available (edit mode only)
    effect(() => {
      const product = this.loadedProduct();
      if (product) {
        untracked(() => {
          this.form.patchValue({
            store_id: product.store.id,
            sku: product.sku ?? '',
            price: product.price,
            compare_at_price: product.compare_at_price,
            stock_quantity: product.stock_quantity,
          });
          this.selectedCatalogProduct.set(product.catalog_product);
          this.form.get('store_id')?.disable({ emitEvent: false });
        });
      }
    });
  }

  ngOnInit(): void {
    this.sub.add(
      this.route.params.subscribe(params => {
        const id = params['id'] || null;
        this.productId.set(id);
        if (id) {
          this.fetchProduct(+id);
        }
      })
    );

    this.sub.add(
      this.form.get('price')?.valueChanges.subscribe(() => {
        this.form.get('compare_at_price')?.updateValueAndValidity({ emitEvent: false });
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
        stores: this.storeService.listStores({}),
        categories: this.categoryService.listCategories({ is_active: true }),
        units: this.productUnitService.listProductUnits({ is_active: true }),
      }).subscribe({
        next: ({ stores, categories, units }) => {
          this.stores.set(stores.data);
          this.categories.set(categories.data);
          this.units.set(units.data);
        },
        error: (err) => {
          this.toast.error(err?.message ?? 'Failed to load stores/categories/units.');
        },
      })
    );
  }

  fetchProduct(id: number): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.loading.set(false);
        this.loadedProduct.set(product);
      },
      error: (err) => {
        this.loading.set(false);
        this.loadError.set(err?.message ?? 'Failed to load this product.');
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

  submit(): void {
    this.catalogProductTouched.set(true);

    if (this.busy()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const catalogProduct = this.selectedCatalogProduct();
    if (!catalogProduct) return;

    const { store_id, sku, price, compare_at_price, stock_quantity } = this.form.getRawValue();

    const id = this.productId();
    const payload: Record<string, unknown> = {
      catalog_product_id: catalogProduct.id,
      price,
      stock_quantity,
      sku: sku || null,
      compare_at_price: compare_at_price === null ? null : compare_at_price,
    };
    if (!id && store_id !== null && store_id !== undefined) {
      payload['store_id'] = store_id;
    }

    this.submitting.set(true);

    const request$ = id
      ? this.productService.updateProduct(+id, payload)
      : this.productService.createProduct(payload);

    request$.subscribe({
      next: (product) => {
        this.submitting.set(false);
        this.toast.success(`Product "${product.catalog_product.name}" ${id ? 'updated' : 'created'} successfully.`);
        this.router.navigate(['/catalog/products', product.id]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(err?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }
}
