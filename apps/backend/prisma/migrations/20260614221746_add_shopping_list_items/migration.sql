-- CreateTable
CREATE TABLE "shopping_list_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "ingredient_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopping_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shopping_list_items_user_id_idx" ON "shopping_list_items"("user_id");

-- CreateIndex
CREATE INDEX "shopping_list_items_ingredient_id_idx" ON "shopping_list_items"("ingredient_id");

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
