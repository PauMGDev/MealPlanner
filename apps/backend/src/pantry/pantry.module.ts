import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PantryController } from './pantry.controller.js';
import { PantryService } from './pantry.service.js';

@Module({
  imports: [AuthModule],
  controllers: [PantryController],
  providers: [PantryService],
})
export class PantryModule {}
