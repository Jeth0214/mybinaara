import { Component, input, output, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { Location } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class SearchBarComponent implements AfterViewInit {
  query = input<string>('');
  queryChange = output<string>();

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  private location = inject(Location);

  ngAfterViewInit() {
    setTimeout(() => this.searchInputRef?.nativeElement.focus(), 200);
  }

  onInput(event: Event) {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }

  goBack() {
    this.location.back();
  }
}
