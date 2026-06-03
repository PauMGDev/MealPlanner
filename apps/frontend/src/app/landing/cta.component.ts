import { Component } from '@angular/core';
import { ScrollRevealDirective } from './scroll-reveal.directive';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [ScrollRevealDirective],
  template: `
    <section id="cta" class="px-8 pb-24 pt-16">
      <div appReveal
           class="relative overflow-hidden max-w-[800px] mx-auto text-center
                  bg-mm-surface border border-white/[0.06] rounded-3xl py-16 px-12">

        <!-- Glow -->
        <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-[500px] h-[300px]
                    cta-glow pointer-events-none"></div>

        <h2 class="relative text-3xl md:text-4xl font-extrabold tracking-tight
                   text-mm-text1 mb-3">
          Empieza a planificar hoy
        </h2>
        <p class="relative text-[17px] text-mm-text2 mb-9">
          Organiza las comidas de tu familia en minutos.
        </p>

        <form class="relative flex gap-3 max-w-[460px] mx-auto flex-col sm:flex-row"
              (submit)="onSubmit($event)">
          <input type="email" placeholder="tu&#64;email.com"
                 class="flex-1 px-5 py-3.5 rounded-[10px] border border-white/[0.06]
                        bg-mm-card text-mm-text1 text-[15px] outline-none
                        transition-colors focus:border-blue-500
                        placeholder:text-mm-text3 font-sans" />
          <button type="submit"
                  class="btn-primary text-base px-8 py-3.5">
            Registrarse
          </button>
        </form>
      </div>
    </section>
  `,
})
export class CtaComponent {
  onSubmit(e: Event): void {
    e.preventDefault();
  }
}
