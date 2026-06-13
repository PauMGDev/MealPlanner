import type { MealType } from '../../core/services/meal-plans.service';

export type MealRowDef = {
  type: MealType;
  label: string;
  dot: string;
  color: string;
  leftBorder: string;
  activePill: string;
  activeBorderTop: string;
  /** Paths SVG (24x24) del icono distintivo del tipo de comida, renderizados con stroke="currentColor" */
  iconPaths: string[];
  /** Clases Tailwind completas para el hover de la celda vacía del calendario (acento por fila) */
  emptyHover: string;
  /** Clases Tailwind completas para el icono de cubiertos en hover de la celda vacía */
  emptyHoverIcon: string;
  /** Clases Tailwind completas para el anillo punteado en hover de la celda vacía */
  emptyHoverRing: string;
  /** Clase Tailwind completa para el overlay sutil de acento sobre el plato vacío */
  accentBg: string;
};

export const MEAL_ROWS: MealRowDef[] = [
  {
    type: 'BREAKFAST', label: 'Desayuno', dot: 'bg-orange-400', color: 'text-orange-400',
    leftBorder: 'border-l-2 border-l-orange-500/50', activePill: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    activeBorderTop: 'border-t-2 border-t-orange-500/60',
    // Sol naciente: arco de sol + línea de horizonte + rayos
    iconPaths: ['M3 17h18', 'M6 17a6 6 0 0112 0', 'M12 8v1.5', 'M7.5 9.5l1 1', 'M16.5 9.5l-1 1'],
    emptyHover: 'hover:border-orange-500/40 hover:bg-orange-500/[0.04]',
    emptyHoverIcon: 'text-orange-400',
    emptyHoverRing: 'group-hover/cell:border-orange-500/50 group-hover/cell:bg-orange-500/[0.06]',
    accentBg: 'bg-orange-500/[0.04]',
  },
  {
    type: 'ALMUERZO', label: 'Almuerzo', dot: 'bg-yellow-400', color: 'text-yellow-400',
    leftBorder: 'border-l-2 border-l-yellow-500/50', activePill: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    activeBorderTop: 'border-t-2 border-t-yellow-500/60',
    // Medio sol: semicírculo superior + rayos cortos
    iconPaths: ['M5 12a7 7 0 0114 0', 'M12 3v2', 'M4.2 12H2.5', 'M21.5 12h-1.7', 'M5.6 6.6l1.2 1.2', 'M18.4 6.6l-1.2 1.2'],
    emptyHover: 'hover:border-yellow-500/40 hover:bg-yellow-500/[0.04]',
    emptyHoverIcon: 'text-yellow-400',
    emptyHoverRing: 'group-hover/cell:border-yellow-500/50 group-hover/cell:bg-yellow-500/[0.06]',
    accentBg: 'bg-yellow-500/[0.04]',
  },
  {
    type: 'LUNCH', label: 'Comida', dot: 'bg-sky-400', color: 'text-sky-400',
    leftBorder: 'border-l-2 border-l-sky-500/50', activePill: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    activeBorderTop: 'border-t-2 border-t-sky-500/60',
    // Sol completo: círculo + 8 rayos cortos
    iconPaths: ['M12 8a4 4 0 100 8 4 4 0 000-8z', 'M12 2.5v1.8', 'M12 19.7v1.8', 'M3.4 12h1.8', 'M18.8 12h1.8', 'M5.6 5.6l1.3 1.3', 'M17.1 17.1l1.3 1.3', 'M5.6 18.4l1.3-1.3', 'M17.1 6.9l1.3-1.3'],
    emptyHover: 'hover:border-sky-500/40 hover:bg-sky-500/[0.04]',
    emptyHoverIcon: 'text-sky-400',
    emptyHoverRing: 'group-hover/cell:border-sky-500/50 group-hover/cell:bg-sky-500/[0.06]',
    accentBg: 'bg-sky-500/[0.04]',
  },
  {
    type: 'SNACK', label: 'Merienda', dot: 'bg-emerald-400', color: 'text-emerald-400',
    leftBorder: 'border-l-2 border-l-emerald-500/50', activePill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    activeBorderTop: 'border-t-2 border-t-emerald-500/60',
    // Hoja: contorno de hoja + nervio central
    iconPaths: ['M12 3.5c4.5 0 8 3.5 8 8-4.5 0-8-3.5-8-8z', 'M12 3.5c-4.5 0-8 3.5-8 8 4.5 0 8-3.5 8-8z', 'M12 11.5v9'],
    emptyHover: 'hover:border-emerald-500/40 hover:bg-emerald-500/[0.04]',
    emptyHoverIcon: 'text-emerald-400',
    emptyHoverRing: 'group-hover/cell:border-emerald-500/50 group-hover/cell:bg-emerald-500/[0.06]',
    accentBg: 'bg-emerald-500/[0.04]',
  },
  {
    type: 'DINNER', label: 'Cena', dot: 'bg-violet-400', color: 'text-violet-400',
    leftBorder: 'border-l-2 border-l-violet-500/50', activePill: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    activeBorderTop: 'border-t-2 border-t-violet-500/60',
    // Luna creciente
    iconPaths: ['M14.5 3.5a8.5 8.5 0 100 17 7.2 7.2 0 010-17z'],
    emptyHover: 'hover:border-violet-500/40 hover:bg-violet-500/[0.04]',
    emptyHoverIcon: 'text-violet-400',
    emptyHoverRing: 'group-hover/cell:border-violet-500/50 group-hover/cell:bg-violet-500/[0.06]',
    accentBg: 'bg-violet-500/[0.04]',
  },
];

export const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const SKELETON_ROWS = [0, 1, 2];
export const SKELETON_DAYS = [0, 1, 2, 3, 4, 5, 6];
export const STORAGE_KEY = 'mm_visible_meals';

export function getThisMonday(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
}

export function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isToday(d: Date): boolean {
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function formatWeekRange(monday: Date): string {
  const end = addDays(monday, 6);
  const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return `${fmt(monday)} – ${fmt(end)}, ${monday.getFullYear()}`;
}

export function formatSlotDate(dateStr: string): string {
  const [y, mo, d] = dateStr.slice(0, 10).split('-').map(Number);
  return new Date(y, mo - 1, d, 12).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function loadVisibleMeals(): MealType[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
