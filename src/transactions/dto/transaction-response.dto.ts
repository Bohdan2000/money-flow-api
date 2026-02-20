import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../../common/enums/transaction-type.enum';

export class TransactionCategoryDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    enum: TransactionType,
    description: 'Transaction type (from category)',
  })
  type: TransactionType;

  @ApiPropertyOptional()
  icon?: string;
}

export class TransactionResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty({ example: 99.99 })
  amount: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty()
  date: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({
    type: TransactionCategoryDto,
    description: 'Populated category (type is on category)',
  })
  categoryId: TransactionCategoryDto;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
