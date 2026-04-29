import { Component, input, output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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

  ngAfterViewInit() {
    setTimeout(() => this.searchInputRef?.nativeElement.focus(), 200);
  }

  onInput(event: Event) {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }
}