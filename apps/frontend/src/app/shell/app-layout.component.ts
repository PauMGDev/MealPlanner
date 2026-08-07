import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { SettingsService } from '../core/services/settings.service';
import { ShellNavComponent } from './shell-nav/shell-nav.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ShellNavComponent],
  templateUrl: './app-layout.component.html',
})
export class AppLayoutComponent implements OnInit {
  private readonly settings = inject(SettingsService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.settings.load().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
