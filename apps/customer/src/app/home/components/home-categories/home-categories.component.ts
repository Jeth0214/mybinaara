import { Component, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-home-categories',
  templateUrl: './home-categories.component.html',
  styleUrls: ['./home-categories.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class HomeCategoriesComponent {
  categories = input<Category[]>([]);
  activeCategory = input<string | null>(null);
  categorySelected = output<Category>();
}
