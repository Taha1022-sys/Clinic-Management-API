import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Appointment date and time (ISO 8601 format)',
    example: '2025-12-20T14:30:00Z',
    type: String,
  })
  @IsNotEmpty({ message: 'Appointment date is required' })
  @IsDateString({}, { message: 'Appointment date must be a valid ISO 8601 date string' })
  appointmentDate: string;

  @ApiProperty({
    description: 'ID of the doctor from Strapi CMS',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Doctor ID is required' })
  @IsNumber({}, { message: 'Doctor ID must be a number' })
  @Min(1, { message: 'Doctor ID must be a positive number' })
  @Type(() => Number)
  strapiDoctorId: number;

  @ApiPropertyOptional({
    description: 'Additional notes or special requests',
    example: 'Please confirm availability for morning slot',
    type: String,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
