import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';

interface MealDay {
  label: string;
  meals: (number | null)[];
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgStyle],
  template: `
    <section class="pt-36 pb-20 px-8 hero-bg">
      <div class="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        <!-- ── Text ── -->
        <div class="flex flex-col gap-6 lg:text-left text-center lg:items-start items-center">

          <div class="inline-flex items-center gap-2 text-[13px] font-semibold text-blue-400
                      bg-blue-500/[0.08] border border-blue-500/[0.15] px-4 py-1.5 rounded-full w-fit">
            <span class="w-[7px] h-[7px] rounded-full bg-blue-400"
                  style="animation: pulse-dot 2s ease-in-out infinite"></span>
            Planificador semanal
          </div>

          <h1 class="text-4xl md:text-5xl lg:text-[56px] font-extrabold leading-[1.1] tracking-tight text-mm-text1">
            Planifica tus comidas
            <span class="grad-text">sin complicaciones</span>
          </h1>

          <p class="text-lg text-mm-text2 max-w-[480px] leading-relaxed">
            Organiza el menú semanal de toda la familia en minutos.
            Genera listas de compra automáticas y, si quieres,
            controla los macros al detalle.
          </p>

          <div class="flex items-center gap-5 flex-wrap">
            <a href="#cta" class="btn-primary text-base px-8 py-3.5">
              Crear mi plan semanal
            </a>
          </div>
        </div>

        <!-- ── Mockup ── -->
        <div class="relative flex justify-center items-center">
          <div class="absolute w-[85%] h-[85%] top-[7%] left-[7%] mockup-glow pointer-events-none"></div>

          <div class="relative w-full max-w-[440px] bg-mm-card border border-white/[0.06]
                      rounded-2xl p-6 shadow-2xl"
               style="animation: float 7s ease-in-out infinite">

            <!-- Header -->
            <div class="flex justify-between items-baseline mb-5">
              <span class="font-bold text-base text-mm-text1">Mi semana</span>
              <span class="text-[13px] text-mm-text3 font-medium">Jun 2 – 8</span>
            </div>

            <!-- Grid -->
            <div class="grid grid-cols-7 gap-1.5 mb-5">
              @for (day of days; track day.label; let i = $index) {
                <div class="flex flex-col gap-1.5 items-center">
                  <span class="text-[11px] font-semibold text-mm-text3 uppercase mb-1">
                    {{ day.label }}
                  </span>
                  @for (meal of day.meals; track $index; let j = $index) {
                    @if (meal !== null) {
                      <div class="w-full aspect-square rounded-md meal-enter"
                           [ngStyle]="{
                             background: palette[meal - 1],
                             '--meal-opacity': (0.82 - j * 0.12) + '',
                             'animation-delay': (0.4 + i * 0.07 + j * 0.04) + 's'
                           }">
                      </div>
                    } @else {
                      <div class="w-full aspect-square rounded-md bg-mm-surface
                                  border border-dashed border-white/[0.06] meal-enter"
                           [ngStyle]="{ '--meal-opacity': '0.4', 'animation-delay': (0.4 + i * 0.07 + j * 0.04) + 's' }">
                      </div>
                    }
                  }
                </div>
              }
            </div>

            <!-- Stats -->
            <div class="flex justify-around pt-4 border-t border-white/[0.06]">
              <div class="flex flex-col items-center gap-0.5">
                <span class="text-lg font-bold text-cyan-400">19</span>
                <span class="text-[11px] text-mm-text3 font-medium">comidas</span>
              </div>
              <div class="flex flex-col items-center gap-0.5">
                <span class="text-lg font-bold text-blue-500">1 847</span>
                <span class="text-[11px] text-mm-text3 font-medium">kcal / día</span>
              </div>
              <div class="flex flex-col items-center gap-0.5">
                <span class="text-lg font-bold text-emerald-400">12</span>
                <span class="text-[11px] text-mm-text3 font-medium">ingredientes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent {
  palette = ['#3b82f6', '#22d3ee', '#34d399'];

  days: MealDay[] = [
    { label: 'L', meals: [1, 1, 1] },
    { label: 'M', meals: [2, 1, 3] },
    { label: 'X', meals: [3, 2, 1] },
    { label: 'J', meals: [1, 3, null] },
    { label: 'V', meals: [2, 1, 2] },
    { label: 'S', meals: [3, null, 1] },
    { label: 'D', meals: [1, 2, 3] },
  ];
}
