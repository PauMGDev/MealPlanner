import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '../generated/prisma/client.js';
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
  findAll(@Req() req: any) {
    return this.recipes.findAll((req.user as User).id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recipe with ingredients and pantry availability' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.recipes.findOne(id, (req.user as User).id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a recipe' })
  create(@Body() dto: CreateRecipeDto, @Req() req: any) {
    return this.recipes.create((req.user as User).id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recipe' })
  update(@Param('id') id: string, @Body() dto: UpdateRecipeDto, @Req() req: any) {
    return this.recipes.update(id, (req.user as User).id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recipe' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.recipes.remove(id, (req.user as User).id);
  }

  @Post(':id/ingredients')
  @ApiOperation({ summary: 'Add an ingredient to a recipe' })
  addIngredient(
    @Param('id') id: string,
    @Body() dto: AddRecipeIngredientDto,
    @Req() req: any,
  ) {
    return this.recipes.addIngredient(id, (req.user as User).id, dto);
  }

  @Delete(':id/ingredients/:ingredientId')
  @ApiOperation({ summary: 'Remove an ingredient from a recipe' })
  removeIngredient(
    @Param('id') id: string,
    @Param('ingredientId') ingredientId: string,
    @Req() req: any,
  ) {
    return this.recipes.removeIngredient(id, (req.user as User).id, ingredientId);
  }
}
