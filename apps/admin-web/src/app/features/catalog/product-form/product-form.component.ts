import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, untracked, OnInit, OnDestroy } from '@angular/core';
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

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

const MIN_IMAGE_DIMENSION = 300;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
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
  readonly busy = computed(() => this.loading() || this.submitting());

  readonly stores = signal<StoreRecord[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly units = signal<ProductUnit[]>([]);

  private slugTouched = false;

  readonly selectedImageFile = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);
  readonly imageError = signal<string | null>(null);
  private objectUrl: string | null = null;

  readonly form = this.fb.group({
    store_id: [null as number | null, [Validators.required]],
    category_id: [null as number | null],
    unit_id: [null as number | null],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    slug: ['', [Validators.required, Validators.maxLength(180), Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    description: ['', [Validators.maxLength(2000)]],
    sku: ['', [Validators.maxLength(50)]],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    compare_at_price: [null as number | null, [comparePriceValidator]],
    stock_quantity: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    effect(() => {
      const isBusy = this.busy();
      untracked(() => {
        if (isBusy) {
          this.form.disable({ emitEvent: false });
        } else {
          this.form.enable({ emitEvent: false });
          if (this.isEditMode()) {
            this.form.get('store_id')?.disable({ emitEvent: false });
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
            category_id: product.category?.id ?? null,
            unit_id: product.unit?.id ?? null,
            name: product.name,
            slug: product.slug,
            description: product.description ?? '',
            sku: product.sku ?? '',
            price: product.price,
            compare_at_price: product.compare_at_price,
            stock_quantity: product.stock_quantity,
          });
          this.slugTouched = true;
          this.imagePreviewUrl.set(product.image_url);
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
      this.form.get('name')?.valueChanges.subscribe((name) => {
        if (!this.slugTouched) {
          this.form.get('slug')?.setValue(slugify(name ?? ''), { emitEvent: false });
        }
      })
    );

    this.sub.add(
      this.form.get('slug')?.valueChanges.subscribe(() => {
        this.slugTouched = true;
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
    this.revokeObjectUrl();
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

  onImageSelect(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (!inputEl.files || inputEl.files.length === 0) return;

    const file = inputEl.files[0];
    this.imageError.set(null);

    if (!file.type.startsWith('image/')) {
      this.imageError.set('Only image files (PNG, JPG, WEBP) are allowed.');
      inputEl.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      this.imageError.set('File size exceeds 2MB limit. Please upload a smaller image.');
      inputEl.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      if (probe.width < MIN_IMAGE_DIMENSION || probe.height < MIN_IMAGE_DIMENSION) {
        this.imageError.set(`Image must be at least ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION}px.`);
        URL.revokeObjectURL(objectUrl);
        inputEl.value = '';
        return;
      }

      this.revokeObjectUrl();
      this.objectUrl = objectUrl;
      this.selectedImageFile.set(file);
      this.imagePreviewUrl.set(objectUrl);
    };
    probe.onerror = () => {
      this.imageError.set('Failed to read image file.');
      URL.revokeObjectURL(objectUrl);
      inputEl.value = '';
    };
    probe.src = objectUrl;
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.productId();
    if (!id && !this.selectedImageFile()) {
      this.imageError.set('A product image is required.');
      return;
    }

    const { store_id, category_id, unit_id, name, slug, description, sku, price, compare_at_price, stock_quantity } =
      this.form.getRawValue();

    const formData = new FormData();
    formData.append('name', name!);
    formData.append('slug', slug!);
    formData.append('price', String(price));
    formData.append('stock_quantity', String(stock_quantity));
    if (description) formData.append('description', description);
    if (sku) formData.append('sku', sku);
    if (category_id !== null && category_id !== undefined) formData.append('category_id', String(category_id));
    if (unit_id !== null && unit_id !== undefined) formData.append('unit_id', String(unit_id));
    if (compare_at_price !== null && compare_at_price !== undefined && compare_at_price !== ('' as unknown)) {
      formData.append('compare_at_price', String(compare_at_price));
    }
    if (!id && store_id !== null && store_id !== undefined) {
      formData.append('store_id', String(store_id));
    }

    const file = this.selectedImageFile();
    if (file) {
      formData.append('image', file, file.name);
    }

    this.submitting.set(true);

    const request$ = id
      ? this.productService.updateProduct(+id, formData)
      : this.productService.createProduct(formData);

    request$.subscribe({
      next: (product) => {
        this.submitting.set(false);
        this.toast.success(`Product "${product.name}" ${id ? 'updated' : 'created'} successfully.`);
        this.router.navigate(['/catalog/products', product.id]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(err?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }
}
