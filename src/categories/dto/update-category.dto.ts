import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '../../common/enums/transaction-type.enum';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Groceries', description: 'Category name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: TransactionType, description: 'Category type' })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({
    example: 'shopping-cart',
    description: 'Icon identifier',
  })
  @IsOptional()
  @IsString()
  icon?: string;
}
