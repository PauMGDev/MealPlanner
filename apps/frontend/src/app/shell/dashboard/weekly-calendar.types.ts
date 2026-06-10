import type { MealType } from '../../core/services/meal-plans.service';

export type MealRowDef = {
  type: MealType;
  label: string;
  dot: string;
  color: string;
  leftBorder: string;
  activePill: string;
};

export const MEAL_ROWS: MealRowDef[] = [
  { type: 'BREAKFAST', label: 'Desayuno', dot: 'bg-orange-400',  color: 'text-orange-400',  leftBorder: 'border-l-2 border-l-orange-500/50',  activePill: 'bg-orange-500/10 text-orange-400 border-orange-500/20'   },
  { type: 'ALMUERZO',  label: 'Almuerzo', dot: 'bg-yellow-400',  color: 'text-yellow-400',  leftBorder: 'border-l-2 border-l-yellow-500/50',  activePill: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'   },
  { type: 'LUNCH',     label: 'Comida',   dot: 'bg-sky-400',     color: 'text-sky-400',     leftBorder: 'border-l-2 border-l-sky-500/50',     activePill: 'bg-sky-500/10 text-sky-400 border-sky-500/20'           },
  { type: 'SNACK',     label: 'Merienda', dot: 'bg-emerald-400', color: 'text-emerald-400', leftBorder: 'border-l-2 border-l-emerald-500/50', activePill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { type: 'DINNER',    label: 'Cena',     dot: 'bg-violet-400',  color: 'text-violet-400',  leftBorder: 'border-l-2 border-l-violet-500/50',  activePill: 'bg-violet-500/10 text-violet-400 border-violet-500/20'   },
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
