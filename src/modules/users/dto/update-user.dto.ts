import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 100,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 100,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
    message: 'Please provide a valid phone number',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'User role (Admin only)',
    enum: Role,
    enumName: 'Role',
    example: Role.PATIENT,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Role must be one of: PATIENT, DOCTOR, ADMIN' })
  role?: Role;

  @ApiPropertyOptional({
    description: 'User active status (Admin only)',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
