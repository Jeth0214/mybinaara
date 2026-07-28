import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, untracked, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/category.model';

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss'
})
export class CategoryFormComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private sub = new Subscription();

  readonly categoryId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.categoryId());

  readonly loadedCategory = signal<Category | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly busy = computed(() => this.loading() || this.submitting());

  private slugTouched = false;

  readonly selectedImageFile = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);
  readonly imageError = signal<string | null>(null);
  private objectUrl: string | null = null;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    slug: ['', [Validators.required, Validators.maxLength(120), Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    description: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    effect(() => {
      const isBusy = this.busy();
      untracked(() => {
        if (isBusy) {
          this.form.disable({ emitEvent: false });
        } else {
          this.form.enable({ emitEvent: false });
        }
      });
    });

    // Patch the form once the fetched category becomes available (edit mode only)
    effect(() => {
      const category = this.loadedCategory();
      if (category) {
        untracked(() => {
          this.form.patchValue({
            name: category.name,
            slug: category.slug,
            description: category.description ?? '',
          });
          this.slugTouched = true;
          this.imagePreviewUrl.set(category.image_url);
        });
      }
    });
  }

  ngOnInit(): void {
    this.sub.add(
      this.route.params.subscribe(params => {
        const id = params['id'] || null;
        this.categoryId.set(id);
        if (id) {
          this.fetchCategory(+id);
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
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.revokeObjectUrl();
  }

  fetchCategory(id: number): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.categoryService.getCategory(id).subscribe({
      next: (category) => {
        this.loading.set(false);
        this.loadedCategory.set(category);
      },
      error: (err) => {
        this.loading.set(false);
        this.loadError.set(err?.message ?? 'Failed to load this category.');
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
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.imageError.set('File size exceeds 2MB limit. Please upload a smaller image.');
      return;
    }

    this.revokeObjectUrl();
    this.objectUrl = URL.createObjectURL(file);
    this.selectedImageFile.set(file);
    this.imagePreviewUrl.set(this.objectUrl);
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

    const { name, slug, description } = this.form.getRawValue();

    const formData = new FormData();
    formData.append('name', name!);
    formData.append('slug', slug!);
    if (description) {
      formData.append('description', description);
    }
    const file = this.selectedImageFile();
    if (file) {
      formData.append('image', file, file.name);
    }

    const id = this.categoryId();
    this.submitting.set(true);

    const request$ = id
      ? this.categoryService.updateCategory(+id, formData)
      : this.categoryService.createCategory(formData);

    request$.subscribe({
      next: (category) => {
        this.submitting.set(false);
        this.toast.success(`Category "${category.name}" ${id ? 'updated' : 'created'} successfully.`);
        this.router.navigate(id ? ['/catalog/categories', category.id] : ['/catalog/categories']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(err?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }
}
