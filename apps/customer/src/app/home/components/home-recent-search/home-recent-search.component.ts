import { Component, input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
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
  recentSearches = input<RecentSearchProduct[]>([]);

  @ViewChild('carousel') carouselRef!: ElementRef<HTMLDivElement>;

  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;

  // Store bound listeners so we can remove them on destroy
  private onMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
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
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) return;
    e.preventDefault();
    const x = e.pageX - this.carouselRef.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.5; // drag speed multiplier
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
