import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, untracked, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductUnitService } from '../../../core/services/product-unit.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductUnit } from '../../../core/models/product-unit.model';

@Component({
  selector: 'app-product-unit-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-unit-form.component.html',
  styleUrl: './product-unit-form.component.scss'
})
export class ProductUnitFormComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly unitService = inject(ProductUnitService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private sub = new Subscription();

  readonly unitId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.unitId());

  readonly loadedUnit = signal<ProductUnit | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly busy = computed(() => this.loading() || this.submitting());

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    abbreviation: ['', [Validators.maxLength(20)]],
    is_active: [true],
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

    // Patch the form once the fetched unit becomes available (edit mode only)
    effect(() => {
      const unit = this.loadedUnit();
      if (unit) {
        untracked(() => {
          this.form.patchValue({
            name: unit.name,
            abbreviation: unit.abbreviation ?? '',
            is_active: unit.is_active,
          });
        });
      }
    });
  }

  ngOnInit(): void {
    this.sub.add(
      this.route.params.subscribe(params => {
        const id = params['id'] || null;
        this.unitId.set(id);
        if (id) {
          this.fetchUnit(+id);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  fetchUnit(id: number): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.unitService.getProductUnit(id).subscribe({
      next: (unit) => {
        this.loading.set(false);
        this.loadedUnit.set(unit);
      },
      error: (err) => {
        this.loading.set(false);
        this.loadError.set(err?.message ?? 'Failed to load this unit.');
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, abbreviation, is_active } = this.form.getRawValue();

    const payload = {
      name: name!,
      abbreviation: abbreviation || null,
      is_active: is_active ?? true,
    };

    const id = this.unitId();
    this.submitting.set(true);

    const request$ = id
      ? this.unitService.updateProductUnit(+id, payload)
      : this.unitService.createProductUnit(payload);

    request$.subscribe({
      next: (unit) => {
        this.submitting.set(false);
        this.toast.success(`Unit "${unit.name}" ${id ? 'updated' : 'created'} successfully.`);
        this.router.navigate(['/catalog/product-units']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(err?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }
}
