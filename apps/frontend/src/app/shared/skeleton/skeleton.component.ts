import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.css',
})
export class SkeletonComponent {
  @Input() set rows(v: number) { this._rows.set(v); }
  @Input() type: 'lines' | 'cards' = 'lines';

  private _rows = signal(3);
  rowsArray = computed(() => Array.from({ length: this._rows() }, (_, i) => i));

  readonly LINE_WIDTHS = ['w-full', 'w-3/4', 'w-1/2'];
  lineWidth(i: number): string { return this.LINE_WIDTHS[i % this.LINE_WIDTHS.length]; }
}
