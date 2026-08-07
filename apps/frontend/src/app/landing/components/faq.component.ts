import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollRevealDirective } from '../scroll-reveal.directive';

/** Accordion rows inside the bento tray. Native <details>, no JS state. */
@Component({
  selector: 'app-faq',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  templateUrl: './faq.component.html',
})
export class FaqComponent {
  readonly questions = [
    {
      q: '¿Necesito crear una cuenta para usar MealMap?',
      a: 'Sí. Tu plan semanal, tu despensa y tus recetas se guardan en tu cuenta para que los tengas disponibles en cualquier dispositivo.',
    },
    {
      q: '¿Puedo entrar con Google?',
      a: 'Sí. Puedes registrarte con correo y contraseña o entrar directamente con tu cuenta de Google.',
    },
    {
      q: '¿Cómo sabe MealMap lo que me falta?',
      a: 'Al añadir una receta al calendario, sus ingredientes se comparan con lo que tienes en la despensa. Lo que no aparece ahí pasa a la lista de la compra.',
    },
    {
      q: '¿Funciona bien en el móvil?',
      a: 'Sí. La interfaz está pensada para usarse con una mano, tanto al planificar en casa como al consultar la lista en el supermercado.',
    },
  ];
}
