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
import { CreatePantryItemDto } from './dto/create-pantry-item.dto.js';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto.js';
import { PantryService } from './pantry.service.js';

@ApiTags('pantry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pantry')
export class PantryController {
  constructor(private readonly pantry: PantryService) {}

  @Get()
  @ApiOperation({ summary: 'List my pantry items' })
  findAll(@Req() req: any) {
    return this.pantry.findAll((req.user as User).id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pantry item by id' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.pantry.findOne(id, (req.user as User).id);
  }

  @Post()
  @ApiOperation({ summary: 'Add an item to my pantry' })
  create(@Body() dto: CreatePantryItemDto, @Req() req: any) {
    return this.pantry.create((req.user as User).id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pantry item' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePantryItemDto,
    @Req() req: any,
  ) {
    return this.pantry.update(id, (req.user as User).id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an item from my pantry' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.pantry.remove(id, (req.user as User).id);
  }
}
