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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';
import { TransactionType } from '../common/enums/transaction-type.enum';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@CurrentUser() user: UserDocument, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user._id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List transactions with optional filters' })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date (ISO 8601)',
  })
  @ApiQuery({ name: 'to', required: false, description: 'End date (ISO 8601)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Max number of results',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number to skip (pagination)',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: TransactionType,
    description: 'Filter by type (via category)',
  })
  @ApiQuery({
    name: 'moneyFlowId',
    required: false,
    description: 'Filter by money flow ID',
  })
  @ApiQuery({
    name: 'tagId',
    required: false,
    description: 'Filter by tag ID (transactions that have this tag)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of transactions',
    type: [TransactionResponseDto],
  })
  findAll(
    @CurrentUser() user: UserDocument,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
    @Query('type') type?: TransactionType,
    @Query('moneyFlowId') moneyFlowId?: string,
    @Query('tagId') tagId?: string,
  ) {
    return this.transactionsService.findAll(user._id, {
      from,
      to,
      type,
      moneyFlowId,
      tagId,
      limit: limit ? parseInt(limit, 10) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction with populated category',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    return this.transactionsService.findOne(id, user._id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Updated transaction',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  update(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, user._id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction deleted' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async remove(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    await this.transactionsService.remove(id, user._id);
  }
}
