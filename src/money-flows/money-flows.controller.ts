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
import { MoneyFlowsService } from './money-flows.service';
import { CreateMoneyFlowDto } from './dto/create-money-flow.dto';
import { UpdateMoneyFlowDto } from './dto/update-money-flow.dto';
import { MoneyFlowResponseDto } from './dto/money-flow-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

@ApiTags('money-flows')
@ApiBearerAuth()
@Controller('money-flows')
@UseGuards(JwtAuthGuard)
export class MoneyFlowsController {
  constructor(private readonly moneyFlowsService: MoneyFlowsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a money flow (e.g. budget, investments)' })
  @ApiResponse({
    status: 201,
    description: 'Money flow created',
    type: MoneyFlowResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateMoneyFlowDto,
  ) {
    return this.moneyFlowsService.create(user._id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List current user money flows' })
  @ApiResponse({
    status: 200,
    description: 'List of money flows',
    type: [MoneyFlowResponseDto],
  })
  findAll(@CurrentUser() user: UserDocument) {
    return this.moneyFlowsService.findAll(user._id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get money flow by ID' })
  @ApiParam({ name: 'id', description: 'Money flow ID' })
  @ApiResponse({
    status: 200,
    description: 'Money flow',
    type: MoneyFlowResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Money flow not found' })
  findOne(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    return this.moneyFlowsService.findOne(id, user._id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a money flow' })
  @ApiParam({ name: 'id', description: 'Money flow ID' })
  @ApiResponse({
    status: 200,
    description: 'Updated money flow',
    type: MoneyFlowResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Money flow not found' })
  update(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdateMoneyFlowDto,
  ) {
    return this.moneyFlowsService.update(id, user._id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a money flow' })
  @ApiParam({ name: 'id', description: 'Money flow ID' })
  @ApiResponse({ status: 200, description: 'Money flow deleted' })
  @ApiResponse({ status: 404, description: 'Money flow not found' })
  async remove(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    await this.moneyFlowsService.remove(id, user._id);
  }
}
