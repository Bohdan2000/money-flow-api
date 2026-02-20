import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token received from login/register/google',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
