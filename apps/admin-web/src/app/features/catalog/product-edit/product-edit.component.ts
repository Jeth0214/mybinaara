import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal, computed, effect, untracked, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserCatalogService } from '../../../core/services/user-catalog.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss'
})
export class ProductEditComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userCatalogService = inject(UserCatalogService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private sub = new Subscription();

  readonly productId = signal<string | null>(null);
  readonly categories = this.userCatalogService.categories;

  readonly imageError = signal<string | null>(null);
  readonly imageUploading = signal<boolean>(false);

  readonly product = computed(() => {
    const id = this.productId();
    return id ? this.userCatalogService.products().find(p => p.id === id) : null;
  });

  readonly editForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', [Validators.required]],
    brand: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    sku: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    image: ['']
  });

  constructor() {
    // Patch the form once the resolved product becomes available
    effect(() => {
      const prod = this.product();
      if (prod) {
        untracked(() => {
          this.editForm.patchValue({
            name: prod.name,
            category: prod.category,
            brand: prod.brand,
            price: prod.price,
            sku: prod.sku,
            description: prod.description,
            image: prod.image
          });
        });
      }
    });
  }

  ngOnInit(): void {
    this.sub.add(
      this.route.params.subscribe(params => {
        this.productId.set(params['id'] || null);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onImageSelect(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (!inputEl.files || inputEl.files.length === 0) return;

    const file = inputEl.files[0];
    const control = this.editForm.get('image');

    this.imageError.set(null);
    this.imageUploading.set(true);

    if (!file.type.startsWith('image/')) {
      this.imageError.set('Only image files (PNG, JPG, WEBP, SVG) are allowed.');
      this.imageUploading.set(false);
      this.cdr.markForCheck();
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.imageError.set('File size exceeds 2MB limit. Please upload a smaller image.');
      this.imageUploading.set(false);
      this.cdr.markForCheck();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      control?.setValue(e.target.result);
      control?.markAsTouched();
      control?.updateValueAndValidity();
      this.imageUploading.set(false);
      this.cdr.markForCheck();
    };
    reader.onerror = () => {
      this.imageError.set('Failed to read image file content.');
      this.imageUploading.set(false);
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const prod = this.product();
    if (!prod) return;

    const { name, category, brand, price, sku, description, image } = this.editForm.value;
    this.userCatalogService.updateProduct(prod.id, { name: name!, category: category!, brand: brand!, price: price!, sku: sku!, description: description!, image: image! });
    this.toast.success(`Product "${name}" updated successfully.`);
    this.router.navigate(['/catalog/products', prod.id]);
  }
}
