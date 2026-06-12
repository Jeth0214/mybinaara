import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface OpportunityProduct {
  name: string;
  category: string;
  searches: number;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-opportunities',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './opportunities.component.html',
  styleUrl: './opportunities.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunitiesComponent {
  @Input() opportunities: OpportunityProduct[] = [];
}
