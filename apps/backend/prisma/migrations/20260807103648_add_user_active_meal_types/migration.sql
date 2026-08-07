-- AlterTable
ALTER TABLE "users" ADD COLUMN     "active_meal_types" "meal_type"[] DEFAULT ARRAY['BREAKFAST', 'LUNCH', 'DINNER']::"meal_type"[];
