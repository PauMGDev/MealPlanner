import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '../generated/prisma/client.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AddRecipeIngredientDto } from './dto/add-recipe-ingredient.dto.js';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';
import { RecipesService } from './recipes.service.js';

@ApiTags('recipes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipes: RecipesService) {}

  @Get()
  @ApiOperation({ summary: 'List my recipes with their ingredients' })
  findAll(@CurrentUser() user: User) {
    return this.recipes.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recipe with ingredients and pantry availability' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.recipes.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a recipe' })
  create(@Body() dto: CreateRecipeDto, @CurrentUser() user: User) {
    return this.recipes.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recipe' })
  update(@Param('id') id: string, @Body() dto: UpdateRecipeDto, @CurrentUser() user: User) {
    return this.recipes.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recipe' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.recipes.remove(id, user.id);
  }

  @Post(':id/ingredients')
  @ApiOperation({ summary: 'Add an ingredient to a recipe' })
  addIngredient(
    @Param('id') id: string,
    @Body() dto: AddRecipeIngredientDto,
    @CurrentUser() user: User,
  ) {
    return this.recipes.addIngredient(id, user.id, dto);
  }

  @Delete(':id/ingredients/:ingredientId')
  @ApiOperation({ summary: 'Remove an ingredient from a recipe' })
  removeIngredient(
    @Param('id') id: string,
    @Param('ingredientId') ingredientId: string,
    @CurrentUser() user: User,
  ) {
    return this.recipes.removeIngredient(id, user.id, ingredientId);
  }
}
