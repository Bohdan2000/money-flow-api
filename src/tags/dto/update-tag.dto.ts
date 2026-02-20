import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTagDto {
  @ApiPropertyOptional({ example: 'important' })
  @IsOptional()
  @IsString()
  name?: string;
}
