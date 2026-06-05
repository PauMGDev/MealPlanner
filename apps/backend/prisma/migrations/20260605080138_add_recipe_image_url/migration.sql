-- DropIndex
DROP INDEX "ingredients_name_trgm_idx";

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "image_url" TEXT;
