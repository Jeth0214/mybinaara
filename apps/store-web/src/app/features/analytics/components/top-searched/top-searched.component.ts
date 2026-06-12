import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface TopSearchedProduct {
  rank: number;
  name: string;
  category: string;
  searches: number;
  maxSearches: number;
  inStore: boolean;
}

@Component({
  selector: 'app-top-searched',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './top-searched.component.html',
  styleUrl: './top-searched.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopSearchedComponent {
  @Input() products: TopSearchedProduct[] = [];
  @Input() selectedDistance = '3 km';

  getProgressWidth(product: TopSearchedProduct): string {
    if (!product.maxSearches) return '0%';
    const pct = (product.searches / product.maxSearches) * 100;
    return `${pct}%`;
  }
}
