import { ApiProperty } from '@nestjs/swagger';

export class TagResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty({ example: 'urgent' })
  name: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
