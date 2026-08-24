import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/category.model';
import { AdminAuthState } from '../../../core/state/auth.state';
import { StoreConfirmModalComponent } from '../../stores/components/store-confirm-modal/store-confirm-modal.component';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.scss'
})
export class CategoryDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private readonly store = inject(Store);
  private sub = new Subscription();

  readonly categoryId = signal<string | null>(null);
  readonly currentUser = this.store.selectSignal(AdminAuthState.user);
  readonly canManage = computed(() => !!this.currentUser()?.permissions.includes('catalog.manage'));

  readonly category = signal<Category | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly mutating = signal(false);
  readonly busy = computed(() => this.loading() || this.mutating());

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
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  fetchCategory(id: number): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.notFound.set(false);

    this.categoryService.getCategory(id).subscribe({
      next: (category) => {
        this.loading.set(false);
        this.category.set(category);
      },
      error: (err) => {
        this.loading.set(false);
        const message: string = err?.message ?? '';
        if (message.toLowerCase().includes('no query results')) {
          this.notFound.set(true);
        } else {
          this.loadError.set(message || 'Failed to load this category.');
        }
      },
    });
  }

  toggleStatus(): void {
    const cat = this.category();
    if (!cat) return;
    const activating = !cat.is_active;

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set(activating ? 'Enable Category' : 'Disable Category');
    modalRef.componentInstance.message.set(
      `Are you sure you want to ${activating ? 'enable' : 'disable'} <strong>${cat.name}</strong>?`
    );
    modalRef.componentInstance.confirmText.set(activating ? 'Enable' : 'Disable');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(!activating);

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) return;

        this.mutating.set(true);
        this.categoryService.toggleCategoryStatus(cat.id).subscribe({
          next: (updated) => {
            this.mutating.set(false);
            this.category.set(updated);
            this.toast.success(`"${cat.name}" is now ${updated.is_active ? 'active' : 'disabled'}.`);
          },
          error: (err) => {
            this.mutating.set(false);
            this.toast.error(err?.message ?? 'Failed to update status.');
          },
        });
      },
      () => {}
    );
  }

  deleteCategory(): void {
    const cat = this.category();
    if (!cat) return;

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set('Delete Category');
    modalRef.componentInstance.message.set(
      `Are you sure you want to delete <strong>${cat.name}</strong>?<br>This action cannot be undone.`
    );
    modalRef.componentInstance.confirmText.set('Delete Category');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(true);

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) return;

        this.mutating.set(true);
        this.categoryService.deleteCategory(cat.id).subscribe({
          next: () => {
            this.mutating.set(false);
            this.toast.success(`"${cat.name}" has been deleted successfully.`);
            this.router.navigate(['/catalog/categories']);
          },
          error: (err) => {
            this.mutating.set(false);
            this.toast.error(err?.message ?? 'Failed to delete category.');
          },
        });
      },
      () => {}
    );
  }
}
