import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '../generated/prisma/client.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto.js';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto.js';
import { PantryService } from './pantry.service.js';

@ApiTags('pantry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pantry')
export class PantryController {
  constructor(private readonly pantry: PantryService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List all ingredient categories' })
  findCategories() {
    return this.pantry.findAllCategories();
  }

  @Get()
  @ApiOperation({ summary: 'List my pantry items' })
  findAll(@CurrentUser() user: User) {
    return this.pantry.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pantry item by id' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.pantry.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add an item to my pantry' })
  create(@Body() dto: CreatePantryItemDto, @CurrentUser() user: User) {
    return this.pantry.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pantry item' })
  update(@Param('id') id: string, @Body() dto: UpdatePantryItemDto, @CurrentUser() user: User) {
    return this.pantry.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an item from my pantry' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.pantry.remove(id, user.id);
  }
}
