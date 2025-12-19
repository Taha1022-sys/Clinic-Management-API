import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Full name of the lead',
    example: 'Sarah Johnson',
    minLength: 2,
    maxLength: 255,
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

  @ApiProperty({
    description: 'Email address of the lead',
    example: 'sarah.johnson@example.com',
    type: String,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Phone number with country code',
    example: '+1-555-123-4567',
    minLength: 5,
    maxLength: 50,
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @MinLength(5, { message: 'Phone number must be at least 5 characters long' })
  @MaxLength(50, { message: 'Phone number must not exceed 50 characters' })
  phone: string;

  @ApiProperty({
    description: 'Country of residence',
    example: 'United States',
    maxLength: 100,
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  @MaxLength(100, { message: 'Country must not exceed 100 characters' })
  country: string;

  @ApiProperty({
    description: 'Treatment or procedure the lead is interested in',
    example: 'Hair Transplant',
    maxLength: 255,
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Interested treatment is required' })
  @MaxLength(255, { message: 'Treatment name must not exceed 255 characters' })
  interestedTreatment: string;

  @ApiPropertyOptional({
    description: 'Additional notes or questions from the lead',
    example: 'I would like to know about the recovery time and pricing.',
    type: String,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
