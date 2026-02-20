import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'urgent', description: 'Tag name' })
  @IsString()
  name: string;
}
