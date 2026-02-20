import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID token from Google Sign-In (mobile or web)',
  })
  @IsNotEmpty()
  @IsString()
  idToken: string;
}
