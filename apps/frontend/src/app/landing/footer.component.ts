import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="px-8 py-8 border-t border-white/[0.06]">
      <div class="max-w-[1200px] mx-auto flex flex-col sm:flex-row
                  items-center justify-between gap-4">

        <!-- Brand -->
        <div class="flex items-center gap-2 font-semibold text-[15px] text-mm-text2">
          <svg viewBox="0 0 28 28" class="w-5 h-5" fill="none">
            <rect x="2" y="2" width="24" height="24" rx="7" fill="#3b82f6" opacity="0.14"/>
            <rect x="6" y="6" width="16" height="16" rx="4" fill="#3b82f6"/>
          </svg>
          <span>MealMap</span>
        </div>

        <!-- Links -->
        <div class="flex gap-6">
          <a href="#" class="text-[13px] text-mm-text3 hover:text-mm-text2 transition-colors">Privacidad</a>
          <a href="#" class="text-[13px] text-mm-text3 hover:text-mm-text2 transition-colors">Términos</a>
          <a href="#" class="text-[13px] text-mm-text3 hover:text-mm-text2 transition-colors">Contacto</a>
        </div>

        <span class="text-xs text-mm-text3">© 2026 MealMap</span>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
