import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTransactionDto {
  @ApiProperty({
    example: 99.99,
    minimum: 0,
    description: 'Transaction amount',
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'USD', description: 'ISO 4217 currency code' })
  @IsString()
  currency: string;

  @ApiProperty({
    example: '2025-02-20',
    description: 'Transaction date (ISO 8601)',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    example: 'Lunch at cafe',
    description: 'Optional note',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Category ID (money flow is derived via category)',
  })
  @IsMongoId()
  categoryId: string;

  @ApiPropertyOptional({
    example: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
    description: 'Tag IDs to attach to the transaction',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : []))
  tagIds?: string[];
}
