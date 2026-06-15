import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserCatalogService } from '../../../core/services/user-catalog.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-4" style="max-width: 1200px;">
      <!-- Header -->
      <div class="mb-4">
        <h4 class="fw-bold mb-1">Category & Brand Configuration</h4>
        <p class="text-muted mb-0">Configure master taxonomy, descriptions, and manufacturing brands for products</p>
      </div>

      <!-- Main Layout Tabs/Columns -->
      <div class="row g-4">
        
        <!-- COLUMN 1: Categories (7/12) -->
        <div class="col-lg-7 col-md-12">
          <div class="card border-0 shadow-sm p-4 mb-4">
            <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              <h6 class="fw-bold text-dark mb-0">Product Categories</h6>
              <button class="btn btn-success btn-sm fs-8 fw-semibold" (click)="toggleAddCatForm()">
                {{ showAddCat() ? 'Hide Form' : 'Create Category' }}
              </button>
            </div>

            <!-- Add Category Inline Form -->
            @if (showAddCat()) {
              <form [formGroup]="catForm" (ngSubmit)="submitCategory()" class="bg-light p-3 rounded-3 mb-3 border animate-fade">
                <div class="mb-2.5">
                  <label class="form-label fw-semibold fs-8 text-uppercase text-muted">Category Name</label>
                  <input
                    type="text"
                    class="form-control form-control-sm fs-7-5"
                    placeholder="e.g. Electrical Panels"
                    formControlName="name"
                  />
                  @if (catForm.get('name')?.touched && catForm.get('name')?.invalid) {
                    <div class="text-danger fs-8-5 mt-1">Name is required (min 3 chars).</div>
                  }
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold fs-8 text-uppercase text-muted">Brief Description</label>
                  <textarea
                    class="form-control form-control-sm fs-7-5"
                    rows="2"
                    placeholder="e.g. Switchboards, breakers and terminal junction layout boxes"
                    formControlName="description"
                  ></textarea>
                  @if (catForm.get('description')?.touched && catForm.get('description')?.invalid) {
                    <div class="text-danger fs-8-5 mt-1">Description is required (min 5 chars).</div>
                  }
                </div>
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-success btn-sm px-3 fs-8 fw-semibold">Save Category</button>
                  <button type="button" class="btn btn-light btn-sm fs-8" (click)="toggleAddCatForm()">Cancel</button>
                </div>
              </form>
            }

            <!-- Categories Table -->
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0 custom-table">
                <thead class="table-light text-uppercase fs-8-5 fw-semibold text-muted">
                  <tr>
                    <th scope="col" class="ps-3">Name / Slug</th>
                    <th scope="col">Description</th>
                    <th scope="col" class="text-center">Products</th>
                    <th scope="col">Status</th>
                    <th scope="col" class="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (cat of categories(); track cat.id) {
                    <tr>
                      <td class="ps-3 py-2.5">
                        <div class="fw-semibold text-dark fs-7-5">{{ cat.name }}</div>
                        <code class="text-muted fs-8 font-monospace">/{{ cat.slug }}</code>
                      </td>
                      <td>
                        <p class="text-muted mb-0 fs-8 text-truncate-2" style="max-width: 260px;">
                          {{ cat.description }}
                        </p>
                      </td>
                      <td class="text-center fw-bold fs-7-5 text-secondary">
                        {{ cat.productCount }}
                      </td>
                      <td>
                        <span [class]="'status-badge status-badge--' + (cat.isActive ? 'active' : 'suspended')">
                          {{ cat.isActive ? 'Active' : 'Disabled' }}
                        </span>
                      </td>
                      <td class="text-end pe-3">
                        <button
                          class="btn btn-icon-btn btn-sm"
                          (click)="toggleCatStatus(cat.id)"
                          [title]="cat.isActive ? 'Disable Category' : 'Enable Category'"
                        >
                          <i class="bi" [class]="cat.isActive ? 'bi-toggle-on text-success fs-5' : 'bi-toggle-off text-muted fs-5'"></i>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- COLUMN 2: Brands (5/12) -->
        <div class="col-lg-5 col-md-12">
          <div class="card border-0 shadow-sm p-4">
            <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              <h6 class="fw-bold text-dark mb-0">Manufacturing Brands</h6>
              <button class="btn btn-success btn-sm fs-8 fw-semibold" (click)="toggleAddBrandForm()">
                {{ showAddBrand() ? 'Hide Form' : 'Add Brand' }}
              </button>
            </div>

            <!-- Add Brand Inline Form -->
            @if (showAddBrand()) {
              <form [formGroup]="brandForm" (ngSubmit)="submitBrand()" class="bg-light p-3 rounded-3 mb-3 border animate-fade">
                <div class="mb-3">
                  <label class="form-label fw-semibold fs-8 text-uppercase text-muted">Brand Name</label>
                  <input
                    type="text"
                    class="form-control form-control-sm fs-7-5"
                    placeholder="e.g. Philips Lighting"
                    formControlName="name"
                  />
                  @if (brandForm.get('name')?.touched && brandForm.get('name')?.invalid) {
                    <div class="text-danger fs-8-5 mt-1">Name is required (min 2 chars).</div>
                  }
                </div>
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-success btn-sm px-3 fs-8 fw-semibold">Save Brand</button>
                  <button type="button" class="btn btn-light btn-sm fs-8" (click)="toggleAddBrandForm()">Cancel</button>
                </div>
              </form>
            }

            <!-- Brands List Table -->
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0 custom-table">
                <thead class="table-light text-uppercase fs-8-5 fw-semibold text-muted">
                  <tr>
                    <th scope="col" class="ps-3">Brand Name</th>
                    <th scope="col" class="text-center">Products</th>
                    <th scope="col">Status</th>
                    <th scope="col" class="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (br of brands(); track br.id) {
                    <tr>
                      <td class="ps-3 py-2.5 fw-semibold text-dark fs-7-5">
                        {{ br.name }}
                      </td>
                      <td class="text-center fw-bold fs-7-5 text-secondary">
                        {{ br.productCount }}
                      </td>
                      <td>
                        <span [class]="'status-badge status-badge--' + (br.isActive ? 'active' : 'suspended')">
                          {{ br.isActive ? 'Active' : 'Disabled' }}
                        </span>
                      </td>
                      <td class="text-end pe-3">
                        <button
                          class="btn btn-icon-btn btn-sm"
                          (click)="toggleBrandStatus(br.id)"
                          [title]="br.isActive ? 'Disable Brand' : 'Enable Brand'"
                        >
                          <i class="bi" [class]="br.isActive ? 'bi-toggle-on text-success fs-5' : 'bi-toggle-off text-muted fs-5'"></i>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .fs-8 {
      font-size: 0.72rem;
    }

    .text-truncate-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.35;
    }

    .animate-fade {
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .custom-table {
      tr {
        transition: background-color 0.15s ease;
      }
      tbody tr:hover {
        background-color: #fcfdfa;
      }
    }
  `]
})
export class CategoryManagementComponent {
  private readonly userCatalogService = inject(UserCatalogService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly categories = this.userCatalogService.categories;
  readonly brands = this.userCatalogService.brands;

  // Toggle Forms Signals
  readonly showAddCat = signal(false);
  readonly showAddBrand = signal(false);

  // Forms Group
  readonly catForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]]
  });

  readonly brandForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  toggleAddCatForm(): void {
    this.showAddCat.update(v => !v);
    this.catForm.reset({ name: '', description: '' });
  }

  toggleAddBrandForm(): void {
    this.showAddBrand.update(v => !v);
    this.brandForm.reset({ name: '' });
  }

  submitCategory(): void {
    if (this.catForm.invalid) {
      this.catForm.markAllAsTouched();
      return;
    }

    const { name, description } = this.catForm.value;
    this.userCatalogService.addCategory(name!, description!);
    this.toast.success(`Category "${name}" created successfully.`);
    this.toggleAddCatForm();
  }

  submitBrand(): void {
    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      return;
    }

    const { name } = this.brandForm.value;
    this.userCatalogService.addBrand(name!);
    this.toast.success(`Brand "${name}" added successfully.`);
    this.toggleAddBrandForm();
  }

  toggleCatStatus(id: string): void {
    this.userCatalogService.toggleCategoryStatus(id);
    const cat = this.categories().find(c => c.id === id);
    if (cat?.isActive) {
      this.toast.success(`Category "${cat.name}" has been enabled.`);
    } else if (cat) {
      this.toast.warning(`Category "${cat.name}" has been disabled.`);
    }
  }

  toggleBrandStatus(id: string): void {
    this.userCatalogService.toggleBrandStatus(id);
    const brand = this.brands().find(b => b.id === id);
    if (brand?.isActive) {
      this.toast.success(`Brand "${brand.name}" has been enabled.`);
    } else if (brand) {
      this.toast.warning(`Brand "${brand.name}" has been disabled.`);
    }
  }
}
