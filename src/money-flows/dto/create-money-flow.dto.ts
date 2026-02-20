import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateMoneyFlowDto {
  @ApiProperty({
    example: 'Monthly budget',
    description: 'Money flow name (e.g. budget, investments)',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Track monthly spending and savings',
    description: 'Optional description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
