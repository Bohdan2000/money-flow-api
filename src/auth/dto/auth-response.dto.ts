import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token for Authorization header' })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token to obtain new access token when expired',
  })
  refreshToken: string;

  @ApiProperty({
    example: 900,
    description: 'Access token lifetime in seconds',
  })
  accessTokenExpiresIn: number;

  @ApiProperty({ type: UserResponseDto, description: 'Authenticated user' })
  user: UserResponseDto;
}

export class RefreshResponseDto {
  @ApiProperty({ description: 'New JWT access token' })
  accessToken: string;

  @ApiProperty({
    description:
      'New refresh token (store and use for next refresh; previous one is invalidated)',
  })
  refreshToken: string;

  @ApiProperty({
    example: 900,
    description: 'Access token lifetime in seconds',
  })
  accessTokenExpiresIn: number;
}
