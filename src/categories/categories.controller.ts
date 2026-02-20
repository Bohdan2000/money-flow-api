import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';
import { TransactionType } from '../common/enums/transaction-type.enum';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  @ApiResponse({
    status: 201,
    description: 'Category created',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({
    status: 409,
    description: 'Category with same name and type already exists',
  })
  create(@CurrentUser() user: UserDocument, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(user._id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List user and system categories' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: TransactionType,
    description: 'Filter by type',
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
    type: [CategoryResponseDto],
  })
  findAll(
    @CurrentUser() user: UserDocument,
    @Query('type') type?: TransactionType,
  ) {
    return this.categoriesService.findAllForUser(user._id, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    return this.categoriesService.findOne(id, user._id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category (user categories only)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Updated category',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Cannot update system category' })
  update(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, user._id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category (user categories only)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete system category' })
  async remove(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    await this.categoriesService.remove(id, user._id);
  }
}
