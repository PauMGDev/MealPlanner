# Auditoría frontend vs `apps/frontend/CLAUDE.md`

> Fecha: 2026-06-10
> Revisión del cumplimiento de las directrices de `apps/frontend/CLAUDE.md` y el `CLAUDE.md` raíz.

> **Nota (2026-06-10):** la norma de tamaño de archivo se relajó de límites estrictos por tipo
> (150/250/100/200 líneas) a una guía suave: *"si un componente supera ~200 líneas, evaluar
> dividir responsabilidades"*. El hook `check-frontend-file-size.js` se actualizó en consecuencia.
> Esto afecta a los hallazgos #1, #2 y #4 de esta tabla: ya no son violaciones de tamaño, pero se
> mantienen porque siguen señalando problemas de arquitectura o mantenibilidad.

## Cambios propuestos

| # | Estado | Prioridad | Archivo(s) | Problema | Cambio propuesto |
|---|---|---|---|---|---|
| 1 | ✅ Hecho | 🟠 Media | `shell/pantry/components/pantry-item-modal.component.ts` (166 líneas) y `.html` (155 líneas) | Componente en `components/` (debería ser dumb) que inyecta `PantryService`/`IngredientsService` y contiene toda la lógica de crear/actualizar y búsqueda con debounce — viola la regla de "dumb sin servicios ni lógica de negocio". Está cerca de la referencia de ~200 líneas | Extraer la lógica de guardado/búsqueda a un servicio o a `pantry.types.ts` (funciones puras + estado), y dividir el template en subcomponentes (ej. `pantry-item-form-fields`, `ingredient-autocomplete-dropdown`) |
| 2 | ⏳ Pendiente | 🟠 Media | `shell/recipes/components/recipe-form-modal.component.ts` y `.html` (110 líneas) | Componente en `components/` (debería ser dumb) que inyecta `RecipesService` y contiene el diff de ingredientes + lógica de guardado | Mover la lógica de diff/guardado (líneas 90-111) al componente padre `recipes.component.ts` o a un servicio dedicado; el modal solo emite el DTO vía `@Output()`. Dividir el template si crece (ej. extraer la sección de pasos/ingredientes a un subcomponente) |
| 3 | ⏳ Pendiente | 🟠 Media | `shell/recipes/components/ingredient-search.component.ts` | Componente dumb (en `components/`) que inyecta `IngredientsService` para el autocomplete | Si se mantiene como widget autocontenido, documentar la excepción; alternativamente, mover la búsqueda al componente padre y pasar resultados vía `@Input()` |
| 4 | ⏳ Pendiente | 🟡 Baja | `shell/pantry/pantry.component.ts` (171 líneas) y `.html` (124 líneas) | Dentro de la referencia de ~200 líneas, pero el bloque de filtrado/orden (`filteredInStockGroups`, líneas 56-81) es lógica compleja dentro del componente | Mover ese bloque a una función pura en `pantry.types.ts` (ej. `filterAndSortGroups()`), testeable por separado. Mejora de mantenibilidad, no urgente |
| 5 | ⏳ Pendiente | 🟡 Media | `landing/cta.component.ts`, `landing/footer.component.ts`, `landing/hero.component.ts`, `landing/landing-page.component.ts`, `landing/navbar.component.ts` | Falta `ChangeDetectionStrategy.OnPush`; usan `template`/`styles` inline en vez de `templateUrl`/`styleUrl`; no tienen `.html`/`.css` propios | Añadir `OnPush` a los 5; extraer `template`/`styles` inline a `*.component.html` y `*.component.css` para alinearlos con `landing/features.component.ts` y `landing/components/*` |
| 6 | ⏳ Pendiente | 🟡 Media | `auth/callback/callback.component.ts` | Falta `ChangeDetectionStrategy.OnPush` | Añadir `changeDetection: ChangeDetectionStrategy.OnPush` al decorador |
| 7 | ⏳ Pendiente | 🟡 Baja | `shell/pantry/pantry.types.ts` | Contiene funciones puras (`buildMergedItems`, `buildGroupedItems`, `expiryBadgeOf`, `getExpiryMs`) sin tests, pese a que `recipes.types.spec.ts` se cita como referencia de cobertura mínima | Crear `pantry.types.spec.ts` con tests unitarios (Vitest) para estas funciones |
| 8 | ⏳ Pendiente | 🟡 Baja | `shell/dashboard/weekly-calendar.types.ts` | Contiene helpers de fecha (`getThisMonday`, `addDays`, `toISODate`, `formatWeekRange`, `formatSlotDate`, `isToday`) sin tests | Crear `weekly-calendar.types.spec.ts` con tests unitarios para estos helpers |
| 9 | ⏳ Pendiente | 🟢 Baja | `shell/pantry/pantry.types.ts` (líneas 1-2), `shell/dashboard/weekly-calendar.types.ts` (línea 1) | Importan tipos (`IngredientResult`, `PantryItem`, `MealType`) desde `core/services/*` en lugar de `core/models/*.types.ts`, que es donde la guía dice que viven los tipos | Cambiar los imports para apuntar directamente a `core/models/pantry.types`, `core/models/ingredient.types` y `core/models/meal-plan.types` |
| 10 | ➖ Sin acción | 🟢 Informativo | `app.routes.ts` (ruta `''`) | `LandingPageComponent` se carga de forma eager (`component:`) en vez de `loadComponent()`, mientras la guía dice "siempre lazy" | Sin acción recomendada — es habitual mantener la home eager para el first paint. Documentar como excepción aceptada si se quiere dejar constancia |

## Notas de implementación

**#1 (2026-06-10):** `PantryItemModalComponent` ya no inyecta `PantryService`/`IngredientsService`.
- La decisión de crear/actualizar/sumar cantidad se movió a funciones puras en `pantry.types.ts`
  (`findExistingMatch`, `buildSaveIntent`, con tests en `pantry.types.spec.ts`).
- El modal emite `(save)` con la intención de guardado y `(searchIngredient)` con el término de
  búsqueda ya debounced; `pantry.component.ts` (smart) ejecuta las llamadas HTTP y pasa
  `[saving]`, `[saveError]`, `[catalogResults]` de vuelta al modal.
- No se dividió el template en subcomponentes adicionales: con la lógica fuera, el `.html` se
  mantiene muy por debajo de la referencia de ~200 líneas y ninguna sección es reutilizable o
  tiene suficiente complejidad propia para justificar la extracción (criterio de
  `apps/frontend/CLAUDE.md`: "template supera 30 líneas, la sección es reutilizable, o tiene
  estado visual propio").

## Resumen por severidad

- 🟠 **Media** (3): componentes "dumb" en `components/` con inyección de servicios y lógica de negocio (`pantry-item-modal`, `recipe-form-modal`, `ingredient-search`)
- 🟡 **Media/Baja** (5): falta de `OnPush`/estructura de archivos en `landing` y `auth/callback`, extracción opcional de lógica en `pantry.component`, y cobertura de tests
- 🟢 **Baja/Informativo** (2): imports de tipos indirectos y excepción de lazy-loading en home
