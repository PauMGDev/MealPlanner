# Auditoría de Diseño y Calidad Frontend — MealMap

> Análisis como Lead Frontend Engineer + Senior UX/UI Designer.  
> Benchmarks de referencia: Linear, Stripe, Notion, Vercel.  
> Fecha: 2026-06-05

---

## SECCIÓN I — PROBLEMAS DETECTADOS

---

### P01 · Logo: dos rectángulos azules concéntricos

**Impacto:** Alto

**Evidencia:** `app-layout.component.ts:19-22`, `navbar.component.ts:20-24`, `login.component.ts:16-20`

```html
<rect x="2" y="2" width="24" height="24" rx="7" fill="#3b82f6" opacity="0.14"/>
<rect x="6" y="6" width="16" height="16" rx="4" fill="#3b82f6"/>
```

**Por qué es un problema:** Este SVG no tiene ninguna iconografía relacionada con comida, planificación o nada. Es literalmente el resultado de `IA: dame un logo de SaaS azul genérico`. El mismo pattern se repite tres veces en la app (navbar, sidebar, login), pero ninguna instancia escala correctamente: la navbar usa `w-[26px]`, la sidebar usa `w-[22px]`, el login usa `w-[26px]`. No hay coherencia de tamaño.

**Solución recomendada:** Crea una identidad visual real. Una cuadrícula 3×3 con una celda destacada (referencia al calendario semanal), o un plato con líneas de división. Centralizar en un componente `LogoComponent` reutilizable con `@Input() size`.

---

### P02 · La estructura del hero es la más genérica del mercado

**Impacto:** Alto

**Evidencia:** `hero.component.ts:20-43`

```html
<!-- Badge pulsante azul -->
<div class="inline-flex ...text-blue-400 bg-blue-500/[0.08] border border-blue-500/[0.15]...">
  <span style="animation: pulse-dot..."></span>
  Planificador semanal
</div>

<!-- H1 con gradient text -->
<h1>Planifica tus comidas <span class="grad-text">sin complicaciones</span></h1>

<!-- Descripción -->
<p class="text-lg text-mm-text2...">Organiza el menú semanal...</p>

<!-- CTA button -->
<a class="btn-primary...">Crear mi plan semanal</a>
```

**Por qué es un problema:** `badge pulsante + h1 con gradiente + descripción + botón primario` es la secuencia más copiada de landing pages AI-generated. El punto pulsante azul sobre fondo azul/8 es un patrón que aparece en el 60% de los proyectos de Tailwind generados con IA.

**Solución recomendada:** Rompe el patrón. Empieza directamente con el H1 sin badge. Usa el gradiente de forma más selectiva (solo en una o dos palabras). Añade social proof real (número de usuarios, testimonios) o un mockup más específico del producto.

---

### P03 · Feature cards: cuatro clones exactos

**Impacto:** Alto

**Evidencia:** `features.component.ts:26-113`

Las cuatro cards comparten exactamente: `bg-mm-card border border-white/[0.06] rounded-2xl p-8 transition-all duration-300 hover:border-white/10 hover:-translate-y-1 hover:shadow-2xl` + icono 52×52 `rounded-[14px]` + h3 + p. Las cards 2 y 4 tienen exactamente el mismo color de icono (`bg-blue-500/[0.12]`).

**Por qué es un problema:** La uniformidad perfecta es la señal más potente de contenido generado por IA. Designs de primer nivel varían el tamaño, el peso visual, el uso del espacio y la presentación entre features. Linear tiene cards con capturas de pantalla inline. Vercel usa layouts asimétricos con ilustraciones propias.

**Solución recomendada:** Dale a cada feature un tratamiento visual distinto. La primera puede ser más grande, la segunda con un mini-mockup animado, la tercera con una lista de ítems. Elimina el hover-translate genérico.

---

### P04 · El hero promete features que no existen

**Impacto:** Alto

**Evidencia:** `hero.component.ts:89-99`

```html
<span class="text-lg font-bold text-blue-500">1 847</span>
<span class="text-[11px] text-mm-text3 font-medium">kcal / día</span>
```

También: "Lista de compra automática" y "Control de macros" en `features.component.ts` no existen en la app real.

**Por qué es un problema:** La app no tiene ninguna función de macros ni calorías ni lista de compra automática. El mockup muestra un contador hardcodeado de `1 847 kcal/día`. Esto genera una expectativa que la app no puede cumplir, lo que destruye la confianza del usuario en el momento en que abre el dashboard.

**Solución recomendada:** Elimina las estadísticas de calorías del mockup. Muestra solo features reales (planificación semanal, recetas, despensa). Si hay roadmap para macros y lista de compra, márcalos claramente como "Próximamente".

---

### P05 · Métricas del dashboard vacías de significado

**Impacto:** Alto

**Evidencia:** `dashboard.component.ts:33-92`

Las tres metric cards muestran solo un número: "5 recetas", "12 ítems en despensa", "8 comidas esta semana". No hay contexto, no hay tendencia, no hay acción.

**Por qué es un problema:** Linear, Stripe y cualquier SaaS de nivel muestra métricas con contexto: comparativa con la semana anterior, progreso hacia un objetivo, acceso directo a la acción relacionada. Un número solo es decorativo, no informativo.

**Solución recomendada:**

```html
<!-- En lugar de solo el número -->
<p class="text-3xl font-bold text-mm-text1">{{ recipeCount() }}</p>

<!-- Algo con valor real -->
<p class="text-3xl font-bold text-mm-text1">{{ recipeCount() }}</p>
<a routerLink="/app/recipes"
   class="text-xs text-blue-400 mt-1 hover:underline flex items-center gap-1">
  Ver todas <svg ...></svg>
</a>
```

---

### P06 · El saludo usa el email completo

**Impacto:** Medio-Alto

**Evidencia:** `dashboard.component.ts:27`

```html
<p class="text-mm-text2 mt-1">Bienvenido, {{ email() }}</p>
```

**Por qué es un problema:** "Bienvenido, usuario@empresa.com" es el saludo más impersonal que puede recibir un usuario. Stripe muestra el nombre. Notion no muestra saludo en absoluto. Mostrar el email hace que parezca un panel de admin, no una app de uso personal.

**Solución recomendada:** Extrae la parte antes del `@`, capitaliza y usa eso. O mejor, añade un campo `name` al registro y úsalo. Alternativamente, elimina el saludo si no aporta valor y sustituye el subtítulo por la fecha de la semana actual.

---

### P07 · Sidebar sin responsive: app inutilizable en tablet

**Impacto:** Alto

**Evidencia:** `app-layout.component.ts:13`

```html
<aside class="w-60 flex-shrink-0 ...">
```

**Por qué es un problema:** `w-60` (240px) es fijo. En una tablet de 768px, el sidebar ocupa el 31% del viewport sin posibilidad de colapsar. No hay ningún breakpoint, ningún hamburger menu, ningún estado colapsado. La app es deficiente en el rango 768px–1024px.

**Solución recomendada:** Implementa sidebar colapsable con un signal `sidebarOpen`, transición CSS `translateX`, y un botón hamburger. En mobile, el sidebar debería ser un drawer por encima del contenido.

---

### P08 · Recipe cards son `<div>` clickables, no elementos interactivos

**Impacto:** Alto (Accesibilidad + UX)

**Evidencia:** `recipes.component.ts:154-156`

```html
<div class="bg-mm-surface border rounded-xl overflow-hidden group ..."
     [class]="cardBorderClass(recipe)"
     (click)="openDetail(recipe)">
```

**Por qué es un problema:** Un `<div>` con `(click)` no es focusable por teclado, no tiene semántica de botón para lectores de pantalla, no tiene `role="button"`, no tiene `tabindex="0"`, no responde a Enter/Space. El 26% de usuarios con discapacidad motora navega con teclado.

**Solución recomendada:**

```html
<button type="button"
        class="bg-mm-surface border rounded-xl overflow-hidden group w-full text-left ..."
        (click)="openDetail(recipe)">
```

---

### P09 · Labels de formulario sin asociación semántica

**Impacto:** Alto (Accesibilidad)

**Evidencia:** `login.component.ts:30-35`

```html
<label class="block text-sm font-medium text-mm-text2 mb-1.5">Email</label>
<input formControlName="email" type="email" ...>
```

**Por qué es un problema:** El `<label>` no tiene atributo `for`, el `<input>` no tiene `id`. Los lectores de pantalla (JAWS, NVDA, VoiceOver) no pueden asociar el label con el input. Al hacer click en el label, el focus no va al input. Este error está en todos los formularios del proyecto (login, register, pantry modal, recipe modal).

**Solución recomendada:**

```html
<label for="email" class="...">Email</label>
<input id="email" formControlName="email" type="email" ...>
```

---

### P10 · Touch targets de 20×20px (delete buttons)

**Impacto:** Alto (Accesibilidad + Mobile UX)

**Evidencia:** `weekly-calendar.component.ts:190-196`

```html
<button class="absolute top-1.5 right-1.5 w-5 h-5 rounded-md ...">
  <svg class="w-3 h-3" ...>
```

El botón de eliminar en el calendario es `w-5 h-5` (20×20px). Apple HIG recomienda mínimo 44×44pt. WCAG 2.5.5 recomienda 44×44px. Android Material Design especifica 48×48dp.

**Solución recomendada:** Amplía el hit area con padding invisible:

```html
<button class="absolute top-1 right-1 p-2 -m-1 rounded-md ...">
  <svg class="w-3 h-3" ...>
```

---

### P11 · Hover actions invisibles en mobile

**Impacto:** Alto (Mobile UX)

**Evidencia:** `recipes.component.ts:182-183`

```html
<div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all"
```

Y en `weekly-calendar.component.ts:191`:

```html
class="... opacity-0 group-hover:opacity-100 ..."
```

**Por qué es un problema:** En dispositivos táctiles no existe el estado `hover`. Los botones de editar/eliminar son literalmente invisibles e inaccesibles en cualquier smartphone. Este patrón afecta a recetas, pantry y calendario.

**Solución recomendada:** Usa `@media (hover: none)` para mostrar los botones siempre en touch devices:

```css
@media (hover: none) {
  .group-hover\:opacity-100 { opacity: 1 !important; }
}
```

O usa un menú contextual de tres puntos (kebab menu) visible en todo momento.

---

### P12 · Bordes con cuatro valores de opacidad casi idénticos

**Impacto:** Medio (Consistencia del sistema de diseño)

**Evidencia:** Dispersos en todos los componentes

| Clase | Uso |
|-------|-----|
| `border-white/[0.04]` | Separadores del calendario |
| `border-white/[0.05]` | Separadores del modal de detalle |
| `border-white/[0.06]` | ~90% de los bordes generales |
| `border-white/[0.07]` | Modal de detalle del calendario |
| `border-white/[0.08]` | Modal del picker |

**Por qué es un problema:** Cinco valores de borde visualmente indistinguibles no es un sistema de diseño, es inconsistencia acumulada. Un diseñador senior usaría máximo dos valores.

**Solución recomendada:** Define en `@theme`:

```css
--color-mm-border: rgba(255,255,255,0.06);       /* uso general */
--color-mm-border-subtle: rgba(255,255,255,0.04); /* separadores */
```

---

### P13 · Escala tipográfica completamente arbitraria

**Impacto:** Medio (Consistencia del sistema de diseño)

**Evidencia:** Dispersos en todos los componentes

Se usan `text-[10px]`, `text-[11px]`, `text-[13px]`, `text-[15px]`, `text-[17px]` como tamaños arbitrarios. Junto con los estándar de Tailwind (`text-xs`, `text-sm`, `text-base`, `text-lg`), la escala tipográfica real del proyecto tiene 9+ tamaños distintos.

**Solución recomendada:** Define en `@theme`:

```css
--text-2xs: 10px;
--text-xs: 11px;  /* override */
--text-sm: 13px;  /* override */
```

Y usa solo: `text-2xs`, `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`.

---

### P14 · `getThisMonday()` duplicada con implementaciones distintas

**Impacto:** Medio (Calidad Angular)

**Evidencia:** `dashboard.component.ts:8-13` y `weekly-calendar.component.ts:27-32`

```typescript
// dashboard.component.ts — devuelve string ISO
function getThisMonday(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(Date.UTC(...)).toISOString().slice(0, 10);
}

// weekly-calendar.component.ts — devuelve Date
function getThisMonday(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(Date.UTC(...));
}
```

**Por qué es un problema:** Mismo algoritmo, dos implementaciones. Si hay un bug en el cálculo del lunes, hay que corregirlo en dos lugares. `toISODate()`, `addDays()`, `isToday()` y `formatWeekRange()` también son utilidades de fecha definidas localmente.

**Solución recomendada:** Crear `apps/frontend/src/app/core/utils/date.utils.ts` con todas las utilidades de fecha compartidas.

---

### P15 · Componentes de 1000+ líneas con templates inline

**Impacto:** Alto (Mantenibilidad Angular)

**Evidencia:**

| Componente | Líneas |
|-----------|--------|
| `recipes.component.ts` | 1254 |
| `pantry.component.ts` | 996 |
| `weekly-calendar.component.ts` | 745 |

**Por qué es un problema:** Los templates inline son razonables hasta ~80-100 líneas. A partir de 200 líneas, la experiencia de desarrollo se degrada (syntax highlighting, autocompletado, type checking). `RecipesComponent` debería descomponerse al menos en: `RecipesListComponent`, `RecipeCardComponent`, `RecipeDetailModalComponent`, `RecipeFormModalComponent`.

**Solución recomendada:** `weekly-calendar.component.ts` → `CalendarGridComponent` + `CalendarCellComponent` + `RecipeDetailModalComponent` + `RecipePickerModalComponent`.

---

### P16 · El formulario CTA usa `querySelector` para leer valores

**Impacto:** Medio (Antipatrón Angular)

**Evidencia:** `cta.component.ts:47-51`

```typescript
onSubmit(e: Event): void {
  e.preventDefault();
  const input = (e.target as HTMLFormElement)
    .querySelector('input[type=email]') as HTMLInputElement;
  const email = input?.value?.trim();
}
```

**Por qué es un problema:** Leer el DOM directamente con `querySelector` en Angular rompe el modelo reactivo, no funciona con SSR, y pierde toda la validación del framework.

**Solución recomendada:**

```typescript
emailCtrl = new FormControl('', [Validators.email]);

onSubmit(): void {
  const email = this.emailCtrl.value?.trim();
  this.router.navigate(['/register'], email ? { queryParams: { email } } : {});
}
```

---

### P17 · El modal del picker no ofrece crear una receta nueva

**Impacto:** Medio (UX Flow)

**Evidencia:** `weekly-calendar.component.ts:505-514`

```html
} @else if (filteredRecipes().length === 0) {
  <div class="flex flex-col items-center justify-center py-16">
    <p class="text-sm font-medium text-mm-text2">Sin resultados</p>
    <p class="text-xs text-mm-text3 mt-1">Prueba con otro término de búsqueda</p>
  </div>
}
```

**Por qué es un problema:** Si el usuario busca una receta que no existe, el único camino es cerrar el modal → navegar a Recetas → crear la receta → volver al Dashboard → volver a abrir el picker. Cuatro pasos adicionales. El estado vacío cuando `allRecipes().length === 0` es especialmente crítico para usuarios nuevos.

**Solución recomendada:** Añade un botón "Crear receta" en el estado vacío del picker, con navegación a `/app/recipes?action=create`.

---

### P18 · El weekly calendar no tiene vista móvil alternativa

**Impacto:** Alto (Mobile UX)

**Evidencia:** `weekly-calendar.component.ts:142-143`

```html
<div class="overflow-x-auto">
  <div class="min-w-[640px] ...">
```

**Por qué es un problema:** En mobile, el usuario debe hacer scroll horizontal en un calendario de 7 columnas. Ninguna app de calendarios de referencia hace esto en mobile (Google Calendar, Fantastical usan vista de día o agenda).

**Solución recomendada:**

```html
<!-- Mobile: lista por día -->
<div class="sm:hidden">
  @for (day of weekDays(); track toISODate(day)) {
    <div class="mb-4">
      <h3>{{ formatDayHeader(day) }}</h3>
      <!-- meals para ese día -->
    </div>
  }
</div>

<!-- Desktop: grid -->
<div class="hidden sm:block overflow-x-auto">
  <!-- grid actual -->
</div>
```

---

### P19 · Validación de formulario asimétrica en Login

**Impacto:** Medio (UX)

**Evidencia:** `login.component.ts:36-38`

```html
@if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
  <p class="text-red-400 text-xs mt-1.5">Introduce un email válido</p>
}
```

El campo `password` no tiene validación inline (required, min length). Solo muestra error global cuando el submit falla. La inconsistencia entre campos del mismo formulario confunde al usuario.

---

### P20 · El estado activo del sidebar no usa un componente centralizado

**Impacto:** Bajo-Medio

**Evidencia:** `app-layout.component.ts:31-71`

El patrón de nav item se repite tres veces con código idéntico: `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-mm-text2 hover:text-mm-text1 hover:bg-white/[0.04] transition-colors text-sm font-medium` + `nav-indicator` span + SVG icon. Si se añade una cuarta sección, hay que copiar y pegar el bloque completo.

**Solución recomendada:** Extraer a un componente `NavItemComponent` con `@Input() label`, `@Input() route`, `@Input() icon`.

---

## SECCIÓN II — SEÑALES ESPECÍFICAS DE DISEÑO GENERADO POR IA

Los 8 patrones que más delatan el origen del diseño:

1. **Badge pulsante azul en el hero** — patrón copiado de miles de landing pages AI.
2. **Gradient text en el H1** — `grad-text` con `#3b82f6 → #22d3ee` es la combinación azul-cyan más usada por LLMs en UI.
3. **Logo de dos rectángulos concéntricos** — iconografía genérica sin significado conceptual.
4. **Cuatro feature cards idénticas** — uniformidad perfecta que ningún diseñador senior aprobaría.
5. **Métricas del dashboard sin acción ni contexto** — placeholder de números, no información útil.
6. **`border border-white/[0.06]` en absolutamente todo** — un solo valor de borde para todo comunica que no hay sistema, hay una clase que se pega en todos sitios.
7. **Saludo con email completo** — ninguna app real de producto hace esto.
8. **Features en la landing que no existen en el producto** — macros, kcal/día, lista de compra automática.

---

## SECCIÓN III — TOP 20 PROBLEMAS POR PRIORIDAD

| # | Problema | Impacto | Categoría |
|---|----------|---------|-----------|
| 1 | Recipe cards son `<div>` no focusables por teclado | Alto | Accesibilidad |
| 2 | Labels sin asociación semántica (`for`/`id`) | Alto | Accesibilidad |
| 3 | Sidebar sin responsive (app inutilizable en tablet/mobile) | Alto | Responsive |
| 4 | Hover actions invisibles en mobile | Alto | Mobile UX |
| 5 | Touch targets de 20×20px | Alto | Accesibilidad |
| 6 | Hero promete features inexistentes (macros, kcal) | Alto | Integridad del producto |
| 7 | Feature cards: cuatro clones exactos | Alto | Diseño visual / AI signal |
| 8 | Logo genérico sin concepto visual | Alto | Identidad visual |
| 9 | Componentes de 1000+ líneas con templates inline | Alto | Mantenibilidad |
| 10 | Weekly calendar sin vista mobile alternativa | Alto | Mobile UX |
| 11 | Dashboard: métricas sin contexto ni acción | Medio-Alto | UX |
| 12 | Saludo con email completo | Medio-Alto | UX |
| 13 | `getThisMonday()` duplicada en dos componentes | Medio | Calidad Angular |
| 14 | Formulario CTA con `querySelector` en lugar de ReactiveForm | Medio | Antipatrón Angular |
| 15 | Picker sin opción de crear receta nueva | Medio | UX Flow |
| 16 | Cuatro valores de borde casi idénticos y arbitrarios | Medio | Sistema de diseño |
| 17 | Escala tipográfica con 9+ tamaños arbitrarios | Medio | Sistema de diseño |
| 18 | Validación asimétrica en formulario de login | Medio | UX Forms |
| 19 | Badge pulsante + gradient text = hero genérico de IA | Medio | Diseño visual |
| 20 | El color azul domina el 100% de los acentos sin variación | Bajo-Medio | Personalidad visual |

---

## SECCIÓN IV — PUNTUACIONES

### Diseño Visual · 5.5 / 10

El tema oscuro está bien ejecutado y el sistema de color base (`mm-base → mm-surface → mm-card → mm-elevated`) es coherente y bien pensado. Las animaciones de entrada son suaves y apropiadas. Sin embargo, el logo es un placeholder, los feature cards son clones perfectos, el hero sigue el patrón más genérico del mercado, y el azul domina absolutamente todos los acentos sin variación de personalidad.

### UX (Experiencia de Usuario) · 4.5 / 10

Los flujos básicos funcionan y hay estados de carga y estados vacíos. Pero hay friction crítica: las hover actions son invisibles en touch, el picker no permite crear recetas, el calendario no tiene vista mobile, las métricas del dashboard no son accionables, y el producto promete features que no existen. La brecha entre lo que la landing muestra y lo que la app entrega destruye la confianza.

### Accesibilidad · 3 / 10

Hay `:focus-visible` global configurado, lo cual es un buen punto de partida. Pero las recipe cards son `<div>` no interactivos, todos los formularios tienen labels sin `for/id`, los touch targets están por debajo del mínimo WCAG, y la comunicación de estado usa solo color sin texto alternativo.

### Calidad Angular · 6.5 / 10

El uso de signals y computed properties es correcto y moderno. Los standalone components, guards e interceptors están bien implementados. El sistema reactivo de `mealGrid` como computed Map para O(1) lookup está bien pensado. Pero los componentes son monolíticos (1000+ líneas), hay funciones utilitarias duplicadas, se usa `querySelector` en un componente, y los templates inline de 400+ líneas son inmanejables.

### Calidad Tailwind · 5 / 10

El sistema de custom properties en `@theme` es el enfoque correcto para Tailwind v4. Pero la ejecución tiene problemas: cinco valores de borde casi idénticos que deberían unificarse, una escala tipográfica con 9+ tamaños donde 5 son arbitrarios, `rounded-[14px]` y `rounded-[10px]` sin definición en el tema, y la clase base de card repetida ~50 veces sin `@apply` ni componente CSS.

### Apariencia Profesional · 5 / 10

A primera vista, el tema oscuro y las animaciones crean una impresión de producto moderno. Pero a los 30 segundos de uso: el logo genérico, el saludo con email, las métricas vacías de significado, y el calendario que en mobile requiere scroll horizontal revelan un proyecto bien construido pero sin refinamiento final de producto.

### ¿Parece generado por IA? · 7 / 10

*(0 = diseñado por equipo senior de producto | 10 = plantilla generada automáticamente)*

El badge pulsante en el hero, el gradient text en el H1, el logo de dos rectángulos, los cuatro feature cards idénticos, el saludo con email completo, el sistema de empty states clonado, y las features prometidas que no existen son señales claras. Lo que baja la puntuación del 10 son las decisiones técnicas reales: el sistema de color `mm-*` bien pensado, el uso de signals computados para el `mealGrid`, y las animaciones CSS personalizadas.

---

## SECCIÓN V — QUICK WINS DE ALTO IMPACTO

Si solo se pueden hacer tres cambios inmediatos:

**1. Convierte las recipe cards en `<button>`** *(30 min, impacto máximo en accesibilidad)*

**2. Añade `for`/`id` a todos los inputs de formularios** *(15 min, WCAG crítico)*

**3. Corrige la invisibilidad de acciones en mobile** *(5 min)*

```css
/* styles.css */
@media (hover: none) {
  .group-hover\:opacity-100 { opacity: 1 !important; }
}
```







---
Auditoría Completa del Calendario — MealMap

---
ANÁLISIS VISUAL

---
Problema 1: Colores Desayuno/Almuerzo son casi indistinguibles

Severidad: Alta

Evidencia: weekly-calendar.component.ts:15-16
{ type: 'BREAKFAST', dot: 'bg-amber-400', ... }
{ type: 'ALMUERZO',  dot: 'bg-yellow-400', ... }
Amber-400 (#fbbf24) y Yellow-400 (#facc15) difieren en apenas 6 puntos de saturación. En las celdas del calendario, los border-l-2 con /50 de opacidad son prácticamente idénticos visualmente.

Impacto en negocio: Destruye la función principal del sistema de colores — identificar de un vistazo qué tipo de comida es cada celda.

Impacto en UX: El usuario tiene que leer la etiqueta de texto para distinguirlos. El color pasa de ser una señal visual a ser decoración.

Motivo técnico: Tailwind usa una escala de color basada en tonos del mismo matiz. Amber y Yellow son adyacentes en el espectro; a /50 opacity desaparecen las diferencias.

Solución propuesta: Usar colores con mayor distancia perceptual. Los 5 tipos deben cubrir el espectro de forma equidistante.

const MEAL_ROWS: MealRowDef[] = [
  { type: 'BRE
];

---
Problema 2: El highlight de "hoy" en celdas es invisible (3% opacidad)

Severidad: Alta

Evidencia: weekly-calendar.component.ts:173
<div class="p-1.5" [class]="isToday(day) ? 'bg-blue-500/[0.03]' : ''">
bg-blue-500/[0.03] equivale a rgba(59,130,246,0.03). Sobre #0f1628, la diferencia de luminancia es ~0.0009 — imperceptible en cualquier monitor.

Impacto en negocio: La columna "hoy" no destaca. El usuario debe buscar el círculo azul en la cabecera para orientarse temporalmente.

Impacto en UX:
[class]="isToday(day) ? 'bg-blue-500/[0.08]' : ''"

<!-- Celdas: mínimo 8%, añadir borde sutil -->
[class]="isToday(day) ? 'bg-blue-500/[0.08] ring-1 ring-inset ring-blue-500/20' : ''"

---
Problema 3: Bordes de la grilla al 4% de opacidad — casi invisibles

Severidad: Media

Evidencia: weekly-calendar.component.ts:162
<div class="grid border-b border-white/[0.04] last:border-0" ...>
border-white/[0.04] = rgba(255,255,255,0.04). En pantallas de baja calidad o con perfil de color incorrecto, estas líneas desaparecen completamente.

Impacto en UX: La cuadrícula pierde su estructura. El ojo no puede seguir una fila horizontalmente.

Solución propuesta: border-white/[0.07] para separadores de fila, border-white/[0.05] para columnas internas.

---
Problema 4: El thumbnail de receta en celdas colapsa a ~24px en móvil

Severidad: Alta

Solución propuesta: Usar responsive hiding del thumbnail:
<div class="hidden sm:block w-12 flex-shrink-0 overflow-hidden">

---
Problema 5: Las celdas vacías son invisibles — affordance prácticamente nula

Severidad: Alta

Evidencia: weekly-calendar.component.ts:213-221
<button class="... border-dashed border-white/[0.06] ...">
  <svg class="... opacity-30 group-hover/cell:opacity-70 ...">
El borde es dashed al 6% de opacidad. El icono + tiene 30% de opacidad en estado normal. En reposo, la celda vacía es funcionalmente invisible. El usuario no sabe que puede hacer clic ahí.

Impacto en negocio: Los usuarios nuevos no descubren cómo añadir recetas. La tasa de activación del calendario cae.

Impacto en UX: El principal CTA del calendario está oculto. Es un anti-patrón de descubribilidad.

Solución propuesta:
<button class="group/cell w-full min-h-[72px] rounded-xl
               border border-dashed border-white/[0.12]
               flex flex-col items-center justify-center gap-1
               transition-all duration-200
               hover:border-blue-500/50 hover:bg-blue-500/[0.06]">
  <svg class="w-4 h-4 text-mm-text3/50 group-hover/cell:text-blue-400
              transition-colors duration-200" ...>
  </svg>
  <!-- Añadir texto subliminal opcional en hover -->
  <span class="text-[10px] text-mm-text3/0 group-hover/cell:text-blue-400/70
               transition-colors duration-200 font-medium">Añadir</span>
</button>

---
Problema 6: Exceso de valores arbitrarios — sistema de diseño inconsistente

Severidad: Media
Visualmente son idénticos pero en el código crean deuda de mantenimiento.

Solución propuesta: Definir tokens en styles.css:
@theme {
  --color-mm-border-subtle:  rgba(255,255,255,0.06);
  --color-mm-border-default: rgba(255,255,255,0.09);
  --color-mm-today-bg:       rgba(59,130,246,0.08);
  --font-size-label:         11px;
  --font-size-micro:         10px;
}

---
Problema 7: border-l-2 de color al 50% — señal de meal type diluida

Severidad: Media

Evidencia: week

---
ANÁLISIS UX DEL CALENDARIO

---
Problema 8: Sin confirmación ni undo al eliminar comidas

Severidad: Crítica

Evidencia: weekly-calendar.component.ts:200-208, 730-742
removeSlot(date, mealType, event) {
  event.stopPropagation();
  this.weeklyPlan.update(...); // optimistic update inmediato
  this.mealPlans.removeMeal(...).subscribe(); // sin error handling
}
El botón × (hover-only) elimina la comida instantáneamente sin confirmación. No hay undo, no hay toast, no hay rollback si falla la API.

Impacto en negocio: Un clic accidental destruye datos planificados. En un planificador semanal donde el usuario ha invertido tiempo, esto genera frustración severa.

Impacto en UX: El usuario no experimenta que ha cometido un error hasta que ya es tarde.

Solución propuesta: Toast con undo de 5 segundos:
removeSlot(date: string, mealType: MealType, event: Event): void {
  event.stopPropagation();
  const backup = this.weeklyPlan();
  this.weeklyPlan.update(plan => ({
    ...plan!,
    meals: plan!.meals.filter(
      m => !(m.date.slice(0, 10) === date && m.mealType === mealType)
    ),
  }));

  this.toastService.show('Comida eliminada', {
    action: 'Deshacer',
    onAction: () => { clearTimeout(timer); this.weeklyPlan.set(backup); },
  });
}

---
Problema 9: Sin manejo de errores en operaciones mutantes

Severidad: Crítica

Evidencia: weekly-calendar.component.ts:716-728
assignRecipe(recipe: Recipe): void {
  this.mealPlans.upsertMeal({ ...slot, recipeId: recipe.id }).subscribe({
    next: meal => { /* actualización optimista */ this.closePicker(); },
    // ← Sin error handler
  });
}
Si la API falla (timeout, 401, 500), el picker se cierra pero la celda permanece vacía sin ningún mensaje. El usuario no sabe si su acción tuvo efecto.

Solución propuesta:
assignRecipe(recipe: Recipe): void {
  const slot = this.pickerSlot();
  if (!slot) return;
  this.mealPlans.upsertMeal({ ...slot, recipeId: recipe.id }).subscribe({
    next: meal => { /* ... */ this.closePicker(); },
    error: () => {
      this.toastService.error('No se pudo guardar. Inténtalo de nuevo.');
      // No cerrar el picker — el usuario puede reintentar
    },
  });
}

---
Problema 10: Sin drag-and-drop — limitación UX fundamental

Severidad: Alta

Evidencia: Ausencia total en weekly-calendar.component.ts.

Solución propuesta: Usar CDK DragDrop de Angular Material:
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

onDrop(event: CdkDragDrop<{ date: string; mealType: MealType }>) {
  const { date: fromDate, mealType: fromType } = event.previousContainer.data;
  const { date: toDate, mealType: toType } = event.container.data;
  if (fromDate === toDate && fromType === toType) return;
  this.mealPlans.moveMeal({ fromDate, fromType, toDate, toType }).subscribe();
}

---
Problema 11: La navegación temporal no distingue pasado/presente/futuro

Severidad: Alta

Evidencia: weekly-calendar.component.ts:148-157
@for (day of we

Solución propuesta:
isPastDay = computed(() => {
  const today = new Date();
  return (d: Date) => d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
});
<div class="p-1.5"
     [class]="isPastDay(day) ? 'opacity-60' : isToday(day) ? 'bg-blue-500/[0.08]' : ''">

---
Problema 12: El picker de recetas no invalida su caché

Severidad: Alta

Evidencia: weekly-calendar.component.ts:697-705
openPicker(date: string, mealType: MealType): void {
  if (!this.rec
Solución propuesta: Cargar siempre al abrir el picker, o implementar un signal de versión en el servicio de recetas:
openPicker(date: string, mealType: MealType): void {
  this.pickerSlot.set({ date, mealType });
  this.recipePickerQuery.set('');
  this.pickerOpen.set(true);
  this.recipesLoaded.set(false); // Force refresh
  this.recipesService.getAll().subscribe({
    next: r => { this.allRecipes.set(r); this.recipesLoaded.set(true); },
  });
}

---
Problema 13: Doble petición HTTP getWeek() en el mismo render

Severidad: Alta

Evidencia: dash

Impacto en rendimiento: Petición duplicada en cada carga del dashboard. En condiciones de red lenta, esto duplica el tiempo de carga visible.

Solución propuesta: Exponer el plan semanal como un signal en el servicio o usar un shared state con shareReplay(1):
@Injectable({ providedIn: 'root' })
export class MealPlansService {
  private weekCache = new Map<string, Observable<WeeklyPlan>>();

  getWeek(weekStart: string): Observable<WeeklyPlan> {
    if (!this.weekCache.has(weekStart)) {
      this.weekCache.set(weekStart,
        this.http.get<WeeklyPlan>(`${this.base}?weekStart=${weekStart}`)
          .pipe(shareReplay(1))
      );
    }
    return this.weekCache.get(weekStart)!;
  }
}

---
ANÁLISIS DE ACCESIBILIDAD

---
Problema 14: Sin estructura semántica en el grid del calendario

Severidad: Crítica

Evidencia: weekly-calendar.component.ts:146-229

El calendario usa <div> con CSS grid para toda su estructura. No existe ningún role="grid", role="row", role="gridcell",

Impacto en negocio: Viola WCAG 2.1 nivel AA. En muchos mercados esto es un requisito legal. Cierra el producto a usuarios con discapacidad visual.

Solución propuesta:
<!-- Contenedor principal -->
<div role="grid" aria-label="Plan semanal" aria-rowcount="6">

  <!-- Cabecera -->
  <div role="row">
    <div role="columnheader" aria-label="Tipo de comida"></div>
    @for (day of weekDays(); ...) {
      <div role="columnheader"
           [attr.aria-label]="dayLabels[i] + ', ' + day.getDate()"
           [attr.aria-current]="isToday(day) ? 'date' : null">
      </div>
    }
      <div role="rowheader">{{ row.label }}</div>
      @for (day of weekDays(); ...) {
        <div role="gridcell">...</div>
      }
    </div>
  }
</div>

---
Problema 15: Botones sin nombres accesibles

Severidad: Crítica

Evidencia: weekly-calendar.component.ts:212-221, 200-208
<!-- Celda vacía — screen reader dice: "botón" -->
<button (click)="openPicker(toISODate(day), row.type)">
  <svg .../>

Impacto en accesibilidad: Un usuario de lector de pantalla escucha "botón, botón, botón..." repetido 35 veces sin ningún contexto.

Solución propuesta:
<button [attr.aria-label]="'Añadir ' + row.label + ' para el ' + formatSlotDate(toISODate(day))"
        (click)="openPicker(toISODate(day), row.type)">

<button [attr.aria-label]="'Eliminar ' + meal.recipe.name + ' de ' + row.label"
        (click)="removeSlot(...)">

---
Problema 16: Sin focus trap ni gestión de foco en modales

Severidad: Crítica

Evidencia: weekl
Impacto en accesibilidad: Un usuario de teclado abre el detail modal y Tab lo lleva al contenido del dashboard detrás. El modal es una trampa visual pero no funcional.

Solución propuesta: Directiva FocusTrap del CDK de Angular:
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  imports: [A11yModule],
  template: `
    <div cdkTrapFocus cdkTrapFocusAutoCapture
         (keydown.escape)="closeDetail()">
      ...
    </div>
  `
})

---

Severidad: Alta

Evidencia: styles.css:9 — --color-mm-text3: #4a5875

Ratio calculado: #4a5875 sobre #070b14 ≈ 3.1:1 (WCAG AA requiere 4.5:1 para texto normal, 3:1 para texto grande).

Los elementos afectados usan este color para texto de tamaño text-[10px] y text-[11px] — texto que requiere ratio 4.5:1 por su pequeño tamaño.

Solución propuesta: Subir el valor a #5d6e8a (~4.6:1) para mantener el tono sin violar el contraste mínimo.

---
Problema 18: Input de búsqueda pierde el focus ring

Severidad: Media

Solución propuesta:
<input class="... focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 ..."

---
ANÁLISIS RESPONSIVE

---
Problema 19: Experiencia móvil es una tabla horizontal que hace scroll

Severidad: Alta

Evidencia: weekly-calendar.component.ts:142-143
<div class="overflow-x-auto">
  <div class="min-w-[640px] rounded-2xl border ...">

En un iPhone 14 (390px de viewport), el usuario ve menos de la mitad del calendario y debe hacer scroll horizontal para ver el resto de la semana. La columna de etiquetas (6.5rem) ocupa el 26% del viewport. Las celdas resultan en ~33px de ancho — inutilizables.

Impacto en negocio: En 2026, más del 60% del tráfico web es móvil. Un planificador de comidas se usa principalmente desde el teléfono.

Solución propuesta: Layout alternativo en móvil: vista de día con navegación swipe, o acordeón por día.
<!-- Mobile: stack vertical por día -->
<div class="block sm:hidden">
  @for (day of weekDays(); ...) {
    <div class="border-b border-white/[0.06]">
      <button class="w-full px-4 py-3 flex items-center justify-between"
              (click)="toggleDay(day)">
        <span>{{ dayLabels[i] }} {{ day.getDate() }}</span>
      </button>
      <!-- Meals for this day -->
    </div>
  }
</div>

<!-- Desktop: grid completo -->
<div class="hidd
---
Problema 20: Sin indicador visual de que el calendario es scrollable horizontalmente

Severidad: Media

Evidencia: weekly-calendar.component.ts:142

El contenedor overflow-x-auto no tiene ningún fade lateral, scroll hint, ni badge "→ desliza". En iOS Safari, la scrollbar horizontal es invisible.

Solución propuesta: Añadir un fade gradient en el lado derecho:
<div class="relative overflow-x-auto">
  <div class="min-w-[640px] ...">...</div>
  <!-- Scroll hint — solo si el contenido desborda -->
  <div class="sm:hidden absolute inset-y-0 right-0 w-8
              bg-gradient-to-l from-mm-base to-transparent pointer-events-none"></div>
</div>
Severidad: Alta

Evidencia: weekly-calendar.component.ts:200-208
<button class="absolute top-1.5 right-1.5 w-5 h-5 ...">
w-5 h-5 = 20×20px. WCAG 2.5.8 (nivel AA en 2.2) requiere 24×24px mínimo; Apple HIG recomienda 44×44px.

Solución propuesta:
<!-- Área de toque aumentada sin cambiar el visual -->
<button class="absolute top-1.5 right-1.5 w-8 h-8
               flex items-center justify-center ...">
  <span class="w-5 h-5 rounded-md bg-black/50 ...
               flex items-center justify-center">
    <svg class="w-3 h-3" .../>
  </span>
</button>

---

Evidencia: weekly-calendar.component.ts — todo el archivo

El componente mezcla:
1. Estado del calendario (semana actual, plan semanal, navegación)
2. Estado del picker de recetas (modal, búsqueda, lista de recetas)
3. Estado del detalle de receta (modal, carga, acciones)
4. Lógica de fecha (formatters, utils)
5. Tres templates completos (grilla, modal detail, modal picker)

Impacto en escalabilidad: Añadir cualquier feature requiere entender las 757 líneas completas. Los tests unitarios son imposibles sin mocking masivo.

Solución propuesta: Dividir en:
weekly-calendar/
├── weekly-calendar.component.ts     (orquestador, ~150 líneas)
├── calendar-gri
Problema 23: getMeal() y isToday() llamados como métodos en el template

Severidad: Alta

Evidencia: weekly-calendar.component.ts:171-172, 150, 173
@let meal = getMeal(day, row.type);      <!-- 35 llamadas/ciclo -->
[class]="isToday(day) ? ... : ''"        <!-- 42 llamadas/ciclo -->
Los métodos en templates Angular se ejecutan en cada ciclo de change detection. Sin OnPush, esto ocurre frecuentemente.

Solución propuesta: Memoizar con computed():
// Precalcular qué días son "hoy" y el mapa de comidas
todaySet = computed(() => {
  const today = toISODate(new Date());
  return new Set([today]);
});

// En el template, usar @let para no llamar métodos
@for (day of weekDays(); ...) {
  @let isTodayDay = todaySet().has(toISODate(day));
  @for (row of filteredMealRows(); ...) {
    @let meal = mealGrid().get(toISODate(day) + '|' + row.type);
  }
}

---
Problema 24: getThisMonday() duplicada en dos componentes

Severidad: Media

Evidencia: dashboard.component.ts:8-13 y weekly-calendar.component.ts:27-32

Implementaciones idénticas copiadas literalmente.

Solución propuesta: Extraer a apps/frontend/src/app/core/utils/date.utils.ts:
export function getThisMonday(): Date { ... }
export function addDays(d: Date, n: number): Date { ... }
export function toISODate(d: Date): string { ... }
export function isToday(d: Date): boolean { ... }
export function formatWeekRange(monday: Date): string { ... }

---
Problema 25: Sin
Severidad: Media

Evidencia: weekly-calendar.component.ts:62
@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  // ← Sin changeDetection: ChangeDetectionStrategy.OnPush

Con signals esto es menos crítico, pero sin OnPush, Angular ejecuta change detection en el componente para cada evento de la app (incluso clicks en sibling components). Con 35 celdas y llamadas a métodos en el template, esto acumula trabajo innecesario.

Solución propuesta:
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})

Severidad: Media

Evidencia: weekly-calendar.component.ts:116, 126, 146, 162
[style.grid-template-columns]="'6.5rem repeat(7, 1fr)'"  <!-- × 4 -->

Solución propuesta:
// En el componente TypeScript
protected readonly gridCols = '6.5rem repeat(7, 1fr)';

// O mejor, una clase CSS custom en styles.css
.calendar-grid { grid-template-columns: 6.5rem repeat(7, 1fr); }

---
Problema 27: Clases de Tailwind en objetos de datos — purging en riesgo

Severidad: Media
Tailwind v4 debería detectar estas clases vía content scanning, pero si la configuración de content no incluye el archivo .ts, estas clases serán purgadas en producción y el CSS no se generará.

Solución propuesta: Verificar que tailwind.config.ts incluye:
content: ['./src/**/*.{html,ts}']
O usar un safelist explícito para las clases dinámicas críticas.

---
RESUMEN FINAL

---
Top 25 Problemas Más Importantes

┌─────┬────────────────────────────────────────────────────────────────────────┬───────────┐
│  #  │                                Problema                                │ Severidad │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 1   │ Sin role
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 5   │ Experiencia móvil: scroll horizontal con celdas de ~24px inutilizables │ Alta      │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 6   │ Celdas vacías con affordance prácticamente nula (borde 6%, icono 30%)  │ Alta      │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 7   │ Colores Desayuno/Almuerzo casi indistinguibles (amber vs yellow)       │ Alta      │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 8   │ Highlight de "hoy" en celdas al 3% de opacidad — invisible             │ Alta      │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 9   │ Sin drag-and-drop para mover comidas entre días/franjas                │ Alta      │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 10  │ Doble petición HTTP getWeek() en Dashboard + Calendar                  │ Alta      │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 11  │ Sin focus trap ni restauración de foco en modales                      │ Alta      │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 12  │ Contraste text-mm-text3 #4a5875 ≈ 3.1:1, falla WCAG AA                 │ Alta      │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 13  │ Picker de recetas no invalida su caché entre sesiones                  │ Alta      │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 14  │ Touch target del botón eliminar = 20px (requiere 44px)                 │ Alta      │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 15  │ getMeal() e isToday() como métodos en template (sin memoización)       │ Alta      │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 16  │ Sin diferenciación visual pasado/presente/futuro en semanas            │ Alta      │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 17  │ Sin estado de error cuando falla la carga del plan                     │ Alta      │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 18  │ Sin navegación por teclado en el picker (flechas, Enter, Escape)       │ Alta      │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 19  │ getThisMonday() duplicada en dos componentes                           │ Media     │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 20  │ 4+ valores arbitrarios distintos de opacidad de borde sin sistema      │ Media     │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 21  │ grid-template-columns hardcodeado como string repetido 4 veces         │ Media     │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 22  │ Sin indicador de scroll horizontal disponible en móvil                 │ Media     │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 23  │ Input de búsqueda usa focus:outline-none sin reemplazo adecuado        │ Media     │
├─────┼────────────────────────────────────────────────────────────────────────┼───────────┤
│ 24  │ Sin núme
└─────┴────────────────────────────────────────────────────────────────────────┴───────────┘

---
Top 10 Quick Wins

1. Añadir aria-label a todos los botones sin texto — 15 minutos, impacto de accesibilidad inmediato.
2. Añadir (keydown.escape)="closeDetail(); closePicker()" a ambos modales — 5 minutos.
3. Aumentar opacidad today highlight a bg-blue-500/[0.10] — 2 minutos, impacto visual significativo.
4. Añadir ChangeDetectionStrategy.OnPush — 1 minuto, mejora de rendimiento garantizada.
5. Extraer getThisMonday() y utils de fecha a calendar.utils.ts — 20 minutos.
6. Aumentar botón eliminar a w-8 h-8 con span interno visual — 5 minutos, accesibilidad touch.
7. Unificar los valores de opacidad de borde a dos tokens — 10 minutos, deuda técnica.
8. Añadir role="grid/row/gridcell" a la estructura — 30 minutos, base de accesibilidad.
9. Usar cdkTrapFocus en ambos modales — 10 minutos tras instalar @angular/cdk.
10. Añadir hidden sm:block al thumbnail en celdas — 2 minutos, arregla móvil inmediatamente.

---
2. Dividir el componente en 5 componentes especializados — Escalabilidad y testabilidad.
3. Implementar sistema undo/toast — Eliminar comidas debe ser reversible con un período de gracia.
4. Añadir drag-and-drop con CDK DragDrop — Feature table stakes para cualquier planificador.
5. Revisar paleta de colores de meal types — Distancia perceptual real entre los 5 tipos.
6. Caché inteligente de recetas en el servicio con invalidación por eventos de mutación.
7. Añadir indicador de progreso semanal — "5/35 comidas planificadas" como barra de progreso o número.
8. Unificar estado de semana en un servicio compartido para eliminar la doble petición HTTP.
9. Añadir número de semana ISO en el header ("Semana 23 — 2 jun – 8 jun").
10. Test coverage — El componente actual no tiene tests. La lógica de mealGrid, filteredRecipes y mutaciones son candidatos perfectos para unit tests con signals.

---
Puntuaciones

┌───────────────────────┬────────────┬────────────────────────────────────────────────────────────────────────────┐
│       Dimensión       │ Puntuación │                                    Nota                                    │
├───────────────
│ Accesibilidad         │ 2/10       │ Sin roles ARIA, sin focus trap, contraste insuficiente, botones sin        │
│                       │            │ nombres                                                                    │
├───────────────────────┼────────────┼────────────────────────────────────────────────────────────────────────────┤
│ Rendimiento           │ 6/10       │ Signals bien usados, pero doble HTTP call y métodos en template            │
├───────────────────────┼────────────┼────────────────────────────────────────────────────────────────────────────┤
│ Calidad Angular       │ 5/10       │ Buena adopción de signals, pero sin OnPush, sin separación de componentes, │
│                       │            │  duplicación                                                               │
├───────────────────────┼────────────┼────────────────────────────────────────────────────────────────────────────┤
│ Calidad Tailwind      │ 4/10       │ Demasiados valores arbitrarios, sin tokens de diseño para magic numbers    │
├───────────────────────┼────────────┼────────────────────────────────────────────────────────────────────────────┤
│ Escalabilidad         │ 3/10       │ 757 líneas monolíticas sin tests y sin separación de concerns              │
├───────────────────────┼────────────┼────────────────────────────────────────────────────────────────────────────┤
│ Percepción premium    │ 6/10       │ La estética oscura es atractiva pero los detalles revelan MVP              │
├───────────────────────┼────────────┼────────────────────────────────────────────────────────────────────────────┤
│ "Parece generado por  │ 7/10       │ Demasiado limpio, sin carácter propio, affordances invisibles, colores     │
│ IA"                   │            │ genéricos                                                                  │
└───────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────┘

---
Lo que un diseñador senior detectaría en menos de 5 minutos

1. "El calendario es un grid invisible." Las líneas de separación existen al 4% de opacidad — en un monitor calibrado a D65, son prácticamente un mito. Sin estructura visual, el ojo no sabe dónde termina una celda y empieza otra.
2. "¿Por qué hay 35 botones idénticos vacíos?" Las celdas vacías no le dicen al usuario que puede hacer clic. Un diseñador senior abriría el inspector, vería que hay un borde dashed al 6% y un icono al 30% y preguntaría qué funcionalidad se está intentando comunicar.
3. "Desayuno y Almuerzo tienen el mismo color." La primera vez que se ve el calendario, amber y yellow suenan distintos. Visualmente sobre fondo oscuro con 50% de opacidad, son el mismo blob dorado.
4. "La columna de hoy no existe visualmente." El círculo azul en la cabecera es bueno. Pero bajar la mirada a las celdas de esa columna revela... nada. El 3% de highlight azul es invisible. La columna "hoy" no tiene más identidad que cualquier otra.
5. "Esto no funciona en el móvil." Un scroll horizontal en un planificador de comidas en 2026 es una señal clara de que el diseño fue pensado exclusivamente para desktop. El primer usuario móvil que intente usar esto se irá.
6. "El botón de eliminar no existe hasta que el ratón pasa por encima." Los destructive actions hidden en hover son un patrón que se usa para no contaminar el visual, pero aquí se ha ido demasiado lejos. El usuario no sabe que puede eliminar hasta que ya está encima.
7. "Los toggles de filtro están medio muertos." El estado inactivo tiene opacity-40. Casi no se ven. Si el usuario oculta "Almuerzo" y no sabe cómo recuperarlo, simplemente se pierden datos.
8. "¿Dónde está el undo?" Un diseñador senior siempre pregunta "¿y si hago clic sin querer?" al ver un botón destructivo. La respuesta aquí es: no hay segunda oportunidad.
9. "Las celdas del picker de recetas tienen un thumbnail de 80px de altura." En un modal de selección de receta, el usuario necesita identificar recetas rápidamente. 80px de imagen con h-20 y un nombre de text-xs con line-clamp-2 es información al límite de lo legible.
10. "El componente pesa 757 líneas. ¿Cómo se testea esto?" Aunque es una observación de ingeniería, cualquier diseñador senior con experiencia en productos sabe que los componentes monolíticos significan bugs que tardan semanas en corregirse, lo que significa features que nunca se construyen.
