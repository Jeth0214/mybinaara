import { Component, input, output } from '@angular/core';

export type SearchFilter = 'all' | 'nearby' | 'price' | 'instock';

interface FilterChip {
  key: SearchFilter;
  label: string;
}

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss'],
  standalone: true,
  imports: [],
})
export class SearchFiltersComponent {
  activeFilter = input<SearchFilter>('all');
  priceAsc = input<boolean>(true);
  filterChange = output<SearchFilter>();

  readonly chips: FilterChip[] = [
    { key: 'all',     label: 'All' },
    { key: 'nearby',  label: 'Nearby' },
    { key: 'price',   label: 'Price' },
    { key: 'instock', label: 'In Stock' },
  ];
}
