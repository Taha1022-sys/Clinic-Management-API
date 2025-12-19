import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password for verification',
    example: 'OldPassword123!',
    minLength: 8,
    maxLength: 100,
    type: String,
  })
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  @MinLength(8, { message: 'Current password must be at least 8 characters' })
  currentPassword: string;

  @ApiProperty({
    description: 'New password (must be strong)',
    example: 'NewPassword123!',
    minLength: 8,
    maxLength: 100,
    type: String,
  })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(100, { message: 'New password must not exceed 100 characters' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'New password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
  })
  newPassword: string;
}
