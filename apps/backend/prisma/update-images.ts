import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Only the 11 that didn't match TheMealDB — trying alternative terms
const MISSING: Array<{ id: string; searches: string[] }> = [
  { id: 'seed-paella-valenciana',    searches: ['paella', 'rice seafood', 'seafood rice'] },
  { id: 'seed-tortilla-espanola',    searches: ['omelette', 'frittata', 'egg'] },
  { id: 'seed-pollo-ajillo',         searches: ['chicken', 'pollo'] },
  { id: 'seed-lentejas-estofadas',   searches: ['lentils', 'dal', 'dahl'] },
  { id: 'seed-ensalada-caprese',     searches: ['mozzarella', 'tomato salad', 'caprese'] },
  { id: 'seed-arroz-con-leche',      searches: ['rice', 'porridge', 'milk rice'] },
  { id: 'seed-croquetas-jamon',      searches: ['croquettes', 'fritter', 'nugget'] },
  { id: 'seed-revuelto-champinones', searches: ['mushroom', 'mushroom pasta', 'mushroom rice'] },
  { id: 'seed-pimientos-rellenos',   searches: ['peppers', 'stuffed bell pepper', 'pepper'] },
  { id: 'seed-patatas-horno',        searches: ['potato', 'chips', 'potatoes'] },
  { id: 'seed-ensalada-garbanzos',   searches: ['chickpea', 'hummus', 'chickpeas'] },
];

interface MealDBResponse {
  meals: Array<{ strMealThumb: string; strMeal: string }> | null;
}

async function fetchImage(search: string): Promise<string | null> {
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(search)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const data = await res.json() as MealDBResponse;
  return data.meals?.[0]?.strMealThumb ?? null;
}

async function main() {
  console.log('Searching TheMealDB for remaining recipes...\n');
  let updated = 0;

  for (const { id, searches } of MISSING) {
    let found = false;
    for (const search of searches) {
      const imageUrl = await fetchImage(search);
      if (imageUrl) {
        await prisma.recipe.updateMany({ where: { id }, data: { imageUrl } });
        console.log(`  ok  ${id.replace('seed-', '')} [${search}] → ${imageUrl.split('/').pop()}`);
        updated++;
        found = true;
        break;
      }
    }
    if (!found) console.log(`  --  ${id.replace('seed-', '')} — no match for any term`);
  }

  console.log(`\nDone: ${updated}/${MISSING.length} additional recipes updated`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
