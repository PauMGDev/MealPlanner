import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MealPlansController } from './meal-plans.controller.js';
import { MealPlansService } from './meal-plans.service.js';

@Module({
  imports: [AuthModule],
  controllers: [MealPlansController],
  providers: [MealPlansService],
})
export class MealPlansModule {}
