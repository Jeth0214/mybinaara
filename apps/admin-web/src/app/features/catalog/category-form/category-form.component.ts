import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal, computed, effect, untracked, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserCatalogService } from '../../../core/services/user-catalog.service';
import { ToastService } from '../../../core/services/toast.service';

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
  private readonly userCatalogService = inject(UserCatalogService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private sub = new Subscription();

  readonly isEditMode = signal(false);
  readonly categoryId = signal<string | null>(null);

  readonly categoryImageError = signal<string | null>(null);
  readonly categoryImageUploading = signal<boolean>(false);

  readonly category = computed(() => {
    const id = this.categoryId();
    return id ? this.userCatalogService.categories().find(c => c.id === id) : null;
  });

  readonly editForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    image: ['', [Validators.required]]
  });

  constructor() {
    // Patch the form once the resolved category becomes available (edit mode only)
    effect(() => {
      const cat = this.category();
      if (cat) {
        untracked(() => {
          this.editForm.patchValue({
            name: cat.name,
            description: cat.description,
            image: cat.image
          });
        });
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.categoryId.set(id);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onCategoryImageSelect(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (!inputEl.files || inputEl.files.length === 0) return;

    const file = inputEl.files[0];
    const control = this.editForm.get('image');

    this.categoryImageError.set(null);
    this.categoryImageUploading.set(true);

    if (!file.type.startsWith('image/')) {
      this.categoryImageError.set('Only image files (PNG, JPG, WEBP, SVG) are allowed.');
      this.categoryImageUploading.set(false);
      this.cdr.markForCheck();
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.categoryImageError.set('File size exceeds 2MB limit. Please upload a smaller image.');
      this.categoryImageUploading.set(false);
      this.cdr.markForCheck();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      control?.setValue(e.target.result);
      control?.markAsTouched();
      control?.updateValueAndValidity();
      this.categoryImageUploading.set(false);
      this.cdr.markForCheck();
    };
    reader.onerror = () => {
      this.categoryImageError.set('Failed to read image file content.');
      this.categoryImageUploading.set(false);
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const { name, description, image } = this.editForm.value;

    if (this.isEditMode()) {
      const cat = this.category();
      if (!cat) return;

      this.userCatalogService.updateCategory(cat.id, { name: name!, description: description!, image: image! });
      this.toast.success(`Category "${name}" updated successfully.`);
      this.router.navigate(['/catalog/categories', cat.id]);
    } else {
      this.userCatalogService.addCategory(name!, description!, image!);
      this.toast.success(`Category "${name}" created successfully.`);
      this.router.navigate(['/catalog/categories']);
    }
  }
}
