import { Component } from '@angular/core';
import { ScrollRevealDirective } from './scroll-reveal.directive';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [ScrollRevealDirective],
  template: `
    <section id="features" class="py-20 px-8">
      <div class="max-w-[1200px] mx-auto text-center">

        <div appReveal>
          <span class="inline-block text-[13px] font-bold tracking-widest uppercase
                       text-cyan-400 mb-3.5">
            Funcionalidades
          </span>
          <h2 class="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight
                     text-mm-text1">
            Todo lo que necesitas,<br/>nada que no
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14 text-left">

          <!-- Planificación visual -->
          <div appReveal [appRevealDelay]="0"
               class="bg-mm-card border border-white/[0.06] rounded-2xl p-8
                      transition-all duration-300 hover:border-white/10
                      hover:-translate-y-1 hover:shadow-2xl">
            <div class="w-[52px] h-[52px] rounded-[14px] bg-cyan-400/[0.12]
                        flex items-center justify-center mb-5">
              <svg viewBox="0 0 32 32" class="w-7 h-7" fill="none"
                   stroke="rgb(34,211,238)" stroke-width="1.8"
                   stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="6" width="24" height="22" rx="4"/>
                <line x1="4" y1="13" x2="28" y2="13"/>
                <line x1="12" y1="6" x2="12" y2="28"/>
                <line x1="20" y1="6" x2="20" y2="28"/>
                <line x1="4" y1="21" x2="28" y2="21"/>
              </svg>
            </div>
            <h3 class="text-[17px] font-bold text-mm-text1 mb-2.5">Planificación visual</h3>
            <p class="text-sm leading-relaxed text-mm-text2">
              Arrastra y organiza las comidas de toda la semana de un vistazo. Tan fácil como un calendario.
            </p>
          </div>

          <!-- Tus propias recetas -->
          <div appReveal [appRevealDelay]="0.1"
               class="bg-mm-card border border-white/[0.06] rounded-2xl p-8
                      transition-all duration-300 hover:border-white/10
                      hover:-translate-y-1 hover:shadow-2xl">
            <div class="w-[52px] h-[52px] rounded-[14px] bg-blue-500/[0.12]
                        flex items-center justify-center mb-5">
              <svg viewBox="0 0 32 32" class="w-7 h-7" fill="none"
                   stroke="rgb(59,130,246)" stroke-width="1.8"
                   stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 4v10c0 3.87 3.13 7 7 7s7-3.13 7-7V4"/>
                <line x1="5" y1="4" x2="27" y2="4"/>
                <line x1="16" y1="21" x2="16" y2="28"/>
                <line x1="10" y1="28" x2="22" y2="28"/>
              </svg>
            </div>
            <h3 class="text-[17px] font-bold text-mm-text1 mb-2.5">Tus propias recetas</h3>
            <p class="text-sm leading-relaxed text-mm-text2">
              Crea y guarda tus propias recetas. Organízalas por tipo de comida y añádelas a tu plan con un clic.
            </p>
          </div>

          <!-- Lista de compra automática -->
          <div appReveal [appRevealDelay]="0.2"
               class="bg-mm-card border border-white/[0.06] rounded-2xl p-8
                      transition-all duration-300 hover:border-white/10
                      hover:-translate-y-1 hover:shadow-2xl">
            <div class="w-[52px] h-[52px] rounded-[14px] bg-emerald-400/[0.12]
                        flex items-center justify-center mb-5">
              <svg viewBox="0 0 32 32" class="w-7 h-7" fill="none"
                   stroke="rgb(52,211,153)" stroke-width="1.8"
                   stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="3" width="20" height="26" rx="3"/>
                <polyline points="11,12 13,14 17,10"/>
                <polyline points="11,19 13,21 17,17"/>
                <line x1="20" y1="12" x2="24" y2="12"/>
                <line x1="20" y1="19" x2="24" y2="19"/>
              </svg>
            </div>
            <h3 class="text-[17px] font-bold text-mm-text1 mb-2.5">Lista de compra automática</h3>
            <p class="text-sm leading-relaxed text-mm-text2">
              Se genera sola a partir de tu plan semanal. Agrupa por categorías para no olvidar nada.
            </p>
          </div>

          <!-- Control de macros -->
          <div appReveal [appRevealDelay]="0.3"
               class="bg-mm-card border border-white/[0.06] rounded-2xl p-8
                      transition-all duration-300 hover:border-white/10
                      hover:-translate-y-1 hover:shadow-2xl">
            <div class="w-[52px] h-[52px] rounded-[14px] bg-blue-500/[0.12]
                        flex items-center justify-center mb-5">
              <svg viewBox="0 0 32 32" class="w-7 h-7" fill="none"
                   stroke="rgb(59,130,246)" stroke-width="1.8"
                   stroke-linecap="round" stroke-linejoin="round">
                <circle cx="16" cy="16" r="12"/>
                <path d="M16 4a12 12 0 0 1 10.39 6L16 16z" fill="rgb(59,130,246)" opacity="0.25" stroke="none"/>
                <circle cx="16" cy="16" r="5" stroke="rgb(34,211,238)"/>
              </svg>
            </div>
            <h3 class="text-[17px] font-bold text-mm-text1 mb-2.5">Control de macros</h3>
            <p class="text-sm leading-relaxed text-mm-text2">
              Para quienes quieren ir más allá: proteínas, carbohidratos y grasas al detalle en cada comida.
            </p>
          </div>

        </div>
      </div>
    </section>
  `,
})
export class FeaturesComponent {}
