import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../../common/enums/transaction-type.enum';

export class CategoryResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty({ example: 'Food' })
  name: string;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiPropertyOptional({ example: 'utensils' })
  icon?: string;

  @ApiProperty({ description: 'Money flow ID this category belongs to' })
  moneyFlowId: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
