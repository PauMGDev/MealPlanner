import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type FeatureCardVariant = 'primary' | 'secondary' | 'tertiary';

@Component({
  selector: 'app-feature-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
  templateUrl: './feature-card.component.html',
})
export class FeatureCardComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
  @Input({ required: true }) variant!: FeatureCardVariant;
  @Input() featured = false;
}
