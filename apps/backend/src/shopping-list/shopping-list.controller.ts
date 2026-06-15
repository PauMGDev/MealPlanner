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
  findAll(@Req() req: any) {
    return this.shoppingList.findAll((req.user as User).id);
  }

  @Get('suggestions')
  @ApiOperation({
    summary:
      'List depleted pantry ingredients needed by recipes planned for the current or future weeks',
  })
  getSuggestions(@Req() req: any) {
    return this.shoppingList.getSuggestions((req.user as User).id);
  }

  @Post()
  @ApiOperation({ summary: 'Add an item to my shopping list' })
  create(@Body() dto: CreateShoppingListItemDto, @Req() req: any) {
    return this.shoppingList.create((req.user as User).id, dto);
  }

  @Delete('checked')
  @ApiOperation({ summary: 'Remove all checked items from my shopping list' })
  clearChecked(@Req() req: any) {
    return this.shoppingList.clearChecked((req.user as User).id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shopping list item' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateShoppingListItemDto,
    @Req() req: any,
  ) {
    return this.shoppingList.update(id, (req.user as User).id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an item from my shopping list' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.shoppingList.remove(id, (req.user as User).id);
  }
}
