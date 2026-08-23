import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal, effect } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, switchMap, catchError, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { CatalogProductService } from '../../../../core/services/catalog-product.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CatalogProduct } from '../../../../core/models/catalog-product.model';
import { Category } from '../../../../core/models/category.model';
import { ProductUnit } from '../../../../core/models/product-unit.model';

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const MIN_IMAGE_DIMENSION = 300;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

/** Search-or-create picker for the shared product catalog. Selecting an
 *  existing entry only needs price/stock from the parent form; creating a
 *  new one uploads the shared identity (name/category/unit/description/image)
 *  that every future vendor listing this same item will reuse. */
@Component({
  selector: 'app-catalog-product-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './catalog-product-picker.component.html',
  styleUrl: './catalog-product-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogProductPickerComponent {
  private fb = inject(FormBuilder);
  private catalogProductService = inject(CatalogProductService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  categories = input<Category[]>([]);
  units = input<ProductUnit[]>([]);
  initialCatalogProduct = input<CatalogProduct | null>(null);
  /** Once a listing exists, its catalog product can't be swapped — same immutability precedent as store_id. */
  locked = input<boolean>(false);

  catalogProductSelected = output<CatalogProduct>();
  catalogProductCleared = output<void>();
  creatingNewChange = output<boolean>();

  readonly selected = signal<CatalogProduct | null>(null);
  readonly query = signal('');
  readonly results = signal<CatalogProduct[]>([]);
  readonly searching = signal(false);
  readonly showResults = signal(false);

  readonly creatingNew = signal(false);
  readonly creating = signal(false);
  readonly selectedImageFile = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);
  readonly imageError = signal<string | null>(null);
  private objectUrl: string | null = null;

  createForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    category_id: [null as number | null, [Validators.required]],
    unit_id: [null as number | null, [Validators.required]],
    description: ['', [Validators.maxLength(2000)]],
  });

  private readonly search$ = new Subject<string>();

  constructor() {
    effect(() => {
      const initial = this.initialCatalogProduct();
      if (initial) this.selected.set(initial);
    });

    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          if (!q.trim()) return of<CatalogProduct[]>([]);
          this.searching.set(true);
          return this.catalogProductService.searchCatalog({ search: q.trim() }).pipe(
            map((response) => response.data),
            catchError((err) => {
              this.toastService.error(err?.message || 'Failed to search the catalog.');
              return of<CatalogProduct[]>([]);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((results) => {
        this.searching.set(false);
        this.results.set(results);
      });

    toObservable(this.query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((q) => this.search$.next(q));
  }

  onQueryInput(value: string): void {
    this.query.set(value);
    this.showResults.set(true);
  }

  select(product: CatalogProduct): void {
    this.selected.set(product);
    this.showResults.set(false);
    this.query.set('');
    this.catalogProductSelected.emit(product);
  }

  changeSelection(): void {
    if (this.locked()) return;
    this.selected.set(null);
    this.catalogProductCleared.emit();
  }

  startCreatingNew(): void {
    this.creatingNew.set(true);
    this.showResults.set(false);
    this.createForm.patchValue({ name: this.query() });
    this.creatingNewChange.emit(true);
  }

  cancelCreatingNew(): void {
    this.creatingNew.set(false);
    this.createForm.reset();
    this.revokeObjectUrl();
    this.selectedImageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.imageError.set(null);
    this.creatingNewChange.emit(false);
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

  removeImage(): void {
    this.revokeObjectUrl();
    this.selectedImageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.imageError.set(null);
  }

  submitNewCatalogProduct(): void {
    if (this.createForm.invalid || this.creating()) {
      this.createForm.markAllAsTouched();
      return;
    }

    const file = this.selectedImageFile();
    if (!file) {
      this.imageError.set('An image is required to create a new catalog product.');
      return;
    }

    const { name, category_id, unit_id, description } = this.createForm.getRawValue();

    const formData = new FormData();
    formData.append('name', name ?? '');
    formData.append('slug', slugify(name ?? ''));
    if (category_id !== null) formData.append('category_id', String(category_id));
    if (unit_id !== null) formData.append('unit_id', String(unit_id));
    if (description) formData.append('description', description);
    formData.append('image', file, file.name);

    this.creating.set(true);

    this.catalogProductService.createCatalogProduct(formData).subscribe({
      next: (product) => {
        this.creating.set(false);
        this.toastService.success(`Added "${product.name}" to the catalog — now set the price & stock and save.`);
        this.cancelCreatingNew();
        this.select(product);
      },
      error: (err) => {
        this.creating.set(false);
        this.toastService.error(err?.message || 'Failed to create catalog product.');
      },
    });
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }
}
