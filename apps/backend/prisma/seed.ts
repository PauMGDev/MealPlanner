import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@mealplanner.com' },
    update: {},
    create: {
      email: 'demo@mealplanner.com',
      passwordHash,
      name: 'Demo User',
      authProvider: 'LOCAL',
    },
  });

  const chicken = await prisma.ingredient.upsert({
    where: { name: 'Chicken breast' },
    update: {},
    create: { name: 'Chicken breast', unit: 'g', caloriesPer100g: 165 },
  });

  const rice = await prisma.ingredient.upsert({
    where: { name: 'White rice' },
    update: {},
    create: { name: 'White rice', unit: 'g', caloriesPer100g: 130 },
  });

  const recipe = await prisma.recipe.upsert({
    where: { id: 'seed-recipe-chicken-rice' },
    update: {},
    create: {
      id: 'seed-recipe-chicken-rice',
      userId: user.id,
      name: 'Chicken and Rice',
      description: 'Simple and nutritious chicken with steamed rice.',
      prepTime: 30,
      servings: 2,
      steps: [
        'Season chicken with salt and pepper.',
        'Cook chicken in a pan over medium heat for 6-7 min per side.',
        'Steam rice according to package instructions.',
        'Serve together.',
      ],
      recipeIngredients: {
        create: [
          { ingredientId: chicken.id, quantity: 200 },
          { ingredientId: rice.id, quantity: 150 },
        ],
      },
    },
  });

  console.log({ user, recipe });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
