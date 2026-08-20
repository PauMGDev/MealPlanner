import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateIngredientDto } from './dto/create-ingredient.dto.js';

interface IngredientRow {
  id: string;
  name: string;
  unit: string;
  calories_per_100g: number | null;
  similarity: number;
}

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.ingredient.findMany({ orderBy: { name: 'asc' } });
  }

  async remove(id: string) {
    try {
      return await this.prisma.ingredient.delete({ where: { id } });
    } catch {
      throw new ConflictException(
        'No se puede eliminar este ingrediente porque está siendo usado en una receta.',
      );
    }
  }

  async search(query: string) {
    if (!query || query.trim().length < 2) return [];

    const rows = await this.prisma.$queryRaw<IngredientRow[]>`
      SELECT id, name, unit, calories_per_100g,
             word_similarity(LOWER(${query}), LOWER(name)) AS similarity
      FROM ingredients
      WHERE word_similarity(LOWER(${query}), LOWER(name)) > 0.2
         OR LOWER(name) LIKE LOWER(${'%' + query + '%'})
      ORDER BY similarity DESC, name ASC
      LIMIT 15
    `;

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      unit: r.unit,
      caloriesPer100g: r.calories_per_100g,
      similarity: r.similarity,
    }));
  }

  async create(dto: CreateIngredientDto) {
    const normalized = dto.name.trim().replace(/\s+/g, ' ');

    // Hard block: case-insensitive exact duplicate
    const exact = await this.prisma.ingredient.findFirst({
      where: { name: { equals: normalized, mode: 'insensitive' } },
    });
    if (exact) {
      throw new ConflictException({ message: 'Ya existe este ingrediente', existing: exact });
    }

    if (!dto.force) {
      // Soft block: fuzzy near-duplicate
      const similar = await this.prisma.$queryRaw<IngredientRow[]>`
        SELECT id, name, unit, calories_per_100g,
               word_similarity(LOWER(${normalized}), LOWER(name)) AS similarity
        FROM ingredients
        WHERE word_similarity(LOWER(${normalized}), LOWER(name)) > 0.5
        ORDER BY similarity DESC
        LIMIT 5
      `;

      if (similar.length > 0) {
        throw new ConflictException({
          message: 'Existen ingredientes similares. Usa force:true para crear igualmente.',
          suggestions: similar.map((r) => ({
            id: r.id,
            name: r.name,
            unit: r.unit,
            caloriesPer100g: r.calories_per_100g,
          })),
        });
      }
    }

    return this.prisma.ingredient.create({
      data: {
        name: normalized,
        unit: dto.unit,
        caloriesPer100g: dto.caloriesPer100g ?? null,
      },
    });
  }
}
