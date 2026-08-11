import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductUnitService } from '../../../core/services/product-unit.service';
import { ToastService } from '../../../core/services/toast.service';
import { MAX_PRODUCTS_PER_STORE } from '../../../core/models/product.model';
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
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
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

  readonly selectedImageFile = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);
  readonly imageError = signal<string | null>(null);
  private objectUrl: string | null = null;
  private currentSlug = '';

  productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    category_id: [null as number | null],
    unit_id: [null as number | null],
    sku: ['', [Validators.maxLength(50)]],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    compare_at_price: [null as number | null, [comparePriceValidator]],
    stock_quantity: [0, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.maxLength(2000)]],
  });

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

    this.sub.add(
      this.productForm.get('name')?.valueChanges.subscribe((name) => {
        this.currentSlug = slugify(name ?? '');
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
          name: product.name,
          category_id: product.category?.id ?? null,
          unit_id: product.unit?.id ?? null,
          sku: product.sku ?? '',
          price: product.price,
          compare_at_price: product.compare_at_price,
          stock_quantity: product.stock_quantity,
          description: product.description ?? '',
        });
        this.imagePreviewUrl.set(product.image_url);
      },
      error: (err) => {
        this.fetching.set(false);
        this.toastService.error(err?.message || 'Product not found.');
        this.router.navigate(['/products']);
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

  onSubmit(): void {
    if (this.productForm.invalid || this.loading()) {
      this.productForm.markAllAsTouched();
      return;
    }

    const id = this.productId();
    if (!id && !this.selectedImageFile()) {
      this.imageError.set('A product image is required.');
      return;
    }

    const { name, category_id, unit_id, sku, price, compare_at_price, stock_quantity, description } =
      this.productForm.getRawValue();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', this.currentSlug || slugify(name));
    formData.append('price', String(price));
    formData.append('stock_quantity', String(stock_quantity));
    if (description) formData.append('description', description);
    if (sku) formData.append('sku', sku);
    if (category_id !== null && category_id !== undefined) formData.append('category_id', String(category_id));
    if (unit_id !== null && unit_id !== undefined) formData.append('unit_id', String(unit_id));
    if (compare_at_price !== null && compare_at_price !== undefined && compare_at_price !== ('' as unknown)) {
      formData.append('compare_at_price', String(compare_at_price));
    }

    const file = this.selectedImageFile();
    if (file) {
      formData.append('image', file, file.name);
    }

    this.loading.set(true);

    const request$ = id ? this.productService.updateProduct(id, formData) : this.productService.createProduct(formData);

    request$.subscribe({
      next: (product) => {
        this.loading.set(false);
        this.toastService.success(`${id ? 'Updated' : 'Listed'} "${product.name}" successfully.`);
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err?.message || `Failed to ${id ? 'update' : 'list'} product.`);
      },
    });
  }
}
