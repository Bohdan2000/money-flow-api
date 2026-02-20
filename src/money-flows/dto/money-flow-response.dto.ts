import { ApiProperty } from '@nestjs/swagger';

export class MoneyFlowResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty({ example: 'Monthly budget' })
  name: string;

  @ApiProperty({ example: 'Track monthly spending' })
  description: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
