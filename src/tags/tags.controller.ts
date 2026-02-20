import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagResponseDto } from './dto/tag-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

@ApiTags('tags')
@ApiBearerAuth()
@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a tag' })
  @ApiResponse({ status: 201, description: 'Tag created', type: TagResponseDto })
  @ApiResponse({ status: 409, description: 'Tag with this name already exists' })
  create(@CurrentUser() user: UserDocument, @Body() dto: CreateTagDto) {
    return this.tagsService.create(user._id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List current user tags' })
  @ApiResponse({ status: 200, description: 'List of tags', type: [TagResponseDto] })
  findAll(@CurrentUser() user: UserDocument) {
    return this.tagsService.findAll(user._id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag', type: TagResponseDto })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  findOne(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    return this.tagsService.findOne(id, user._id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Updated tag', type: TagResponseDto })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  update(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdateTagDto,
  ) {
    return this.tagsService.update(id, user._id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag deleted' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async remove(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    await this.tagsService.remove(id, user._id);
  }
}
