import { Component, input, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon, IonBadge } from '@ionic/angular/standalone';
import { RecentSearchProduct } from '../../../core/models/recent-search.model';

@Component({
  selector: 'app-home-recent-search',
  templateUrl: './home-recent-search.component.html',
  styleUrls: ['./home-recent-search.component.scss'],
  standalone: true,
  imports: [IonIcon, IonBadge],
})
export class HomeRecentSearchComponent implements AfterViewInit, OnDestroy {
  private router = inject(Router);

  recentSearches = input<RecentSearchProduct[]>([]);

  @ViewChild('carousel') carouselRef!: ElementRef<HTMLDivElement>;

  private isDragging = false;
  private hasDragged = false;
  private startX = 0;
  private scrollLeft = 0;

  private readonly CATEGORY_ICONS: Record<string, string> = {
    Cement: 'cube-outline',
    Glass: 'apps-outline',
    Steel: 'cut-outline',
    Wood: 'leaf-outline',
    Paint: 'color-palette-outline',
    Tiles: 'grid-outline',
  };

  getCategoryIcon(category: string): string {
    return this.CATEGORY_ICONS[category] ?? 'hammer-outline';
  }

  navigateToProduct(id: string): void {
    if (this.hasDragged) return;
    this.router.navigate(['/product', id]);
  }

  private onMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.hasDragged = false;
    this.startX = e.pageX - this.carouselRef.nativeElement.offsetLeft;
    this.scrollLeft = this.carouselRef.nativeElement.scrollLeft;
    this.carouselRef.nativeElement.classList.add('dragging');
  };

  private onMouseLeave = () => {
    this.isDragging = false;
    this.carouselRef.nativeElement.classList.remove('dragging');
  };

  private onMouseUp = () => {
    this.isDragging = false;
    this.carouselRef.nativeElement.classList.remove('dragging');
    setTimeout(() => { this.hasDragged = false; }, 0);
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) return;
    e.preventDefault();
    this.hasDragged = true;
    const x = e.pageX - this.carouselRef.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.carouselRef.nativeElement.scrollLeft = this.scrollLeft - walk;
  };

  ngAfterViewInit() {
    if (!this.carouselRef) return;
    const el = this.carouselRef.nativeElement;
    el.addEventListener('mousedown', this.onMouseDown);
    el.addEventListener('mouseleave', this.onMouseLeave);
    el.addEventListener('mouseup', this.onMouseUp);
    el.addEventListener('mousemove', this.onMouseMove);
  }

  ngOnDestroy() {
    if (!this.carouselRef) return;
    const el = this.carouselRef.nativeElement;
    el.removeEventListener('mousedown', this.onMouseDown);
    el.removeEventListener('mouseleave', this.onMouseLeave);
    el.removeEventListener('mouseup', this.onMouseUp);
    el.removeEventListener('mousemove', this.onMouseMove);
  }
}
