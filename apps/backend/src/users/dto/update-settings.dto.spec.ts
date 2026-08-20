import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { UpdateSettingsDto } from './update-settings.dto.js';

function errorsFor(activeMealTypes: unknown) {
  return validateSync(plainToInstance(UpdateSettingsDto, { activeMealTypes }));
}

describe('UpdateSettingsDto', () => {
  it('accepts between three and five distinct meal types', () => {
    expect(errorsFor(['BREAKFAST', 'LUNCH', 'DINNER'])).toHaveLength(0);
    expect(errorsFor(['BREAKFAST', 'ALMUERZO', 'LUNCH', 'SNACK', 'DINNER'])).toHaveLength(0);
  });

  it('rejects fewer than three, duplicates and unknown values', () => {
    expect(errorsFor(['BREAKFAST', 'DINNER']).length).toBeGreaterThan(0);
    expect(errorsFor(['LUNCH', 'LUNCH', 'DINNER']).length).toBeGreaterThan(0);
    expect(errorsFor(['BREAKFAST', 'BRUNCH', 'DINNER']).length).toBeGreaterThan(0);
  });
});
