-- Enable pg_trgm for fuzzy ingredient search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index on ingredient names for fast trigram similarity queries
CREATE INDEX "ingredients_name_trgm_idx" ON "ingredients" USING GIN (name gin_trgm_ops);

-- Link pantry items to the global ingredient catalog (nullable for backwards compatibility)
ALTER TABLE "pantry_items" ADD COLUMN "ingredient_id" TEXT;

CREATE INDEX "pantry_items_ingredient_id_idx" ON "pantry_items"("ingredient_id");

ALTER TABLE "pantry_items" ADD CONSTRAINT "pantry_items_ingredient_id_fkey"
  FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
