import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';

/**
 * Shared chrome for the public auth surfaces: micro top bar, split layout with
 * the form on the left and a cropped product capture on the right, the Google
 * entry point and the cross link to the other form.
 *
 * The form itself (fields, error alert, submit button) is projected, so each
 * screen keeps its own validation and state.
 */
@Component({
  selector: 'app-auth-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './auth-shell.component.html',
})
export class AuthShellComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) subtitle!: string;
  @Input({ required: true }) footerText!: string;
  @Input({ required: true }) footerLinkLabel!: string;
  @Input({ required: true }) footerLink!: string;

  /** Full page redirect: the backend guard bounces the browser to Google. */
  readonly googleUrl = `${environment.apiUrl}/auth/google`;
}
