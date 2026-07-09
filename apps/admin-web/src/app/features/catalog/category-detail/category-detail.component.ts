import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserCatalogService } from '../../../core/services/user-catalog.service';
import { ToastService } from '../../../core/services/toast.service';
import { StoreConfirmModalComponent } from '../../stores/components/store-confirm-modal/store-confirm-modal.component';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.scss'
})
export class CategoryDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly userCatalogService = inject(UserCatalogService);
  private readonly toast = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private sub = new Subscription();

  readonly categoryId = signal<string | null>(null);

  readonly category = computed(() => {
    const id = this.categoryId();
    return id ? this.userCatalogService.categories().find(c => c.id === id) : null;
  });

  ngOnInit(): void {
    this.sub.add(
      this.route.params.subscribe(params => {
        this.categoryId.set(params['id'] || null);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleStatus(): void {
    const cat = this.category();
    if (!cat) return;

    const isDisabling = cat.isActive;

    const modalRef = this.modalService.open(StoreConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title.set(isDisabling ? 'Disable Category' : 'Enable Category');
    modalRef.componentInstance.message.set(
      `Are you sure you want to ${isDisabling ? 'disable' : 'enable'} <strong>${cat.name}</strong>?`
    );
    modalRef.componentInstance.confirmText.set(isDisabling ? 'Disable' : 'Enable');
    modalRef.componentInstance.cancelText.set('Cancel');
    modalRef.componentInstance.isDanger.set(isDisabling);

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.userCatalogService.toggleCategoryStatus(cat.id);
          if (isDisabling) {
            this.toast.warning(`Category "${cat.name}" has been disabled.`);
          } else {
            this.toast.success(`Category "${cat.name}" has been enabled.`);
          }
        }
      },
      () => {}
    );
  }
}
