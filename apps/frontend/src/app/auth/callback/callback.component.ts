import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lp-auth lp-auth--centered">
      <div class="lp-auth__status">
        <span class="lp-spinner" aria-hidden="true"></span>
        <p role="status">Iniciando sesión...</p>
      </div>
    </div>
  `,
})
export class CallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.auth.handleCallback(token);
  }
}
