import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '../../common/enums/transaction-type.enum';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Food', description: 'Category name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: TransactionType, description: 'Category type' })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({
    example: 'utensils',
    description: 'Icon identifier for UI',
  })
  @IsOptional()
  @IsString()
  icon?: string;
}
