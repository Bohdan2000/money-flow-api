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

  @ApiPropertyOptional({
    description: 'User ID if user-specific; null for system category',
  })
  userId?: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
