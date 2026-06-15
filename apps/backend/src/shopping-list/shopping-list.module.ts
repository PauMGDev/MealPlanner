import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ShoppingListController } from './shopping-list.controller.js';
import { ShoppingListService } from './shopping-list.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ShoppingListController],
  providers: [ShoppingListService],
})
export class ShoppingListModule {}
