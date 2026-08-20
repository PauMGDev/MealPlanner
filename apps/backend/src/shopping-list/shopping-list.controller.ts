import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '../generated/prisma/client.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateShoppingListItemDto } from './dto/create-shopping-list-item.dto.js';
import { UpdateShoppingListItemDto } from './dto/update-shopping-list-item.dto.js';
import { ShoppingListService } from './shopping-list.service.js';

@ApiTags('shopping-list')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shopping-list')
export class ShoppingListController {
  constructor(private readonly shoppingList: ShoppingListService) {}

  @Get()
  @ApiOperation({ summary: 'List my shopping list items' })
  findAll(@CurrentUser() user: User) {
    return this.shoppingList.findAll(user.id);
  }

  @Get('suggestions')
  @ApiOperation({
    summary:
      'List depleted pantry ingredients needed by recipes planned for the current or future weeks',
  })
  getSuggestions(@CurrentUser() user: User) {
    return this.shoppingList.getSuggestions(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add an item to my shopping list' })
  create(@Body() dto: CreateShoppingListItemDto, @CurrentUser() user: User) {
    return this.shoppingList.create(user.id, dto);
  }

  @Delete('checked')
  @ApiOperation({ summary: 'Remove all checked items from my shopping list' })
  clearChecked(@CurrentUser() user: User) {
    return this.shoppingList.clearChecked(user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shopping list item' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateShoppingListItemDto,
    @CurrentUser() user: User,
  ) {
    return this.shoppingList.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an item from my shopping list' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.shoppingList.remove(id, user.id);
  }
}
