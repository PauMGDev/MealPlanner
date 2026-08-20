import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { IngredientsModule } from './ingredients/ingredients.module.js';
import { MealPlansModule } from './meal-plans/meal-plans.module.js';
import { PantryModule } from './pantry/pantry.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RecipesModule } from './recipes/recipes.module.js';
import { ShoppingListModule } from './shopping-list/shopping-list.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    RecipesModule,
    PantryModule,
    IngredientsModule,
    MealPlansModule,
    ShoppingListModule,
  ],
})
export class AppModule {}
