-- This migration is non-transactional
ALTER TYPE "meal_type" ADD VALUE 'ALMUERZO';
CREATE UNIQUE INDEX "meals_user_id_date_meal_type_key" ON "meals"("user_id", "date", "meal_type");
