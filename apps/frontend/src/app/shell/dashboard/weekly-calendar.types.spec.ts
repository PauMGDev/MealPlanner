import { describe, it, expect } from 'vitest';
import { MEAL_ROWS } from './weekly-calendar.types';

describe('MEAL_ROWS', () => {
  it('defines one row per meal type without duplicates', () => {
    const types = MEAL_ROWS.map(r => r.type);
    expect(new Set(types).size).toBe(types.length);
    expect(types).toEqual(['BREAKFAST', 'ALMUERZO', 'LUNCH', 'SNACK', 'DINNER']);
  });

  it('provides at least one icon path per meal type', () => {
    for (const row of MEAL_ROWS) {
      expect(row.iconPaths.length).toBeGreaterThan(0);
      for (const path of row.iconPaths) {
        expect(path).toMatch(/^[MmLlHhVvCcSsQqTtAaZz0-9.,\- ]+$/);
      }
    }
  });

  it('provides explicit hover accent classes for empty calendar cells', () => {
    for (const row of MEAL_ROWS) {
      expect(row.emptyHover).toContain('hover:border-');
      expect(row.emptyHover).toContain('hover:bg-');
      expect(row.emptyHoverIcon).toMatch(/^text-/);
      expect(row.emptyHoverRing).toContain('group-hover/cell:border-');
    }
  });

  it('provides an accent overlay background for the empty plate placeholder', () => {
    for (const row of MEAL_ROWS) {
      expect(row.accentBg).toMatch(/^bg-.+\/\[0\.04\]$/);
    }
  });

  it('provides a top border accent for the active filter pill', () => {
    for (const row of MEAL_ROWS) {
      expect(row.activeBorderTop).toContain('border-t-2');
    }
  });
});
