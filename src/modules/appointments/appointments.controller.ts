import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { AppointmentStatus } from './entities/appointment.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; // Guard importunu unutmayalım

@ApiTags('Appointments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard) // Guard'ı tüm controller'a uyguladık
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Book a new appointment',
    description: 'Create a new appointment. Validates doctor availability and date.',
  })
  @ApiResponse({
    status: 201,
    description: 'Appointment successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or time slot not available',
  })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() user: User,
  ) {
    return this.appointmentsService.create(createAppointmentDto, user);
  }

  // 👇 EKLENEN KISIM: Frontend bu adresi özel olarak istiyor
  @Get('my-appointments')
  @ApiOperation({
    summary: 'Get my appointments',
    description: 'Get all appointments for the logged-in user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user appointments',
  })
  async getMyAppointments(@CurrentUser() user: User) {
    return this.appointmentsService.findAllForUser(user.id);
  }
  // 👆 EKLENEN KISIM BİTTİ

  @Get()
  @ApiOperation({
    summary: 'Get all appointments',
    description: 'Admin gets all appointments. Regular users get only their own.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of appointments',
  })
  async findAll(@CurrentUser() user: User) {
    if (user.role === Role.ADMIN) {
      return this.appointmentsService.findAll();
    }
    return this.appointmentsService.findAllForUser(user.id);
  }

  @Get('available-slots')
  @ApiOperation({
    summary: 'Get available time slots for a doctor',
    description: 'Returns available hourly slots (9 AM - 5 PM) for a specific doctor and date.',
  })
  @ApiQuery({
    name: 'doctorId',
    required: true,
    type: Number,
    description: 'Doctor ID from Strapi',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available time slots (ISO 8601 strings)',
  })
  async getAvailableSlots(
    @Query('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getAvailableSlots(Number(doctorId), date);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get appointment details',
    description: 'Retrieve details of a specific appointment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment details',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const userId = user.role === Role.ADMIN ? undefined : user.id;
    return this.appointmentsService.findOne(id, userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel an appointment',
    description: 'Cancel a pending or confirmed appointment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment cancelled successfully',
  })
  async cancel(@Param('id') id: string, @CurrentUser() user: User) {
    const userId = user.role === Role.ADMIN ? undefined : user.id;
    return this.appointmentsService.cancel(id, userId);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update appointment status (Admin only)',
    description: 'Change appointment status to CONFIRMED, CANCELLED, or COMPLETED.',
  })
  @ApiQuery({
    name: 'status',
    required: true,
    enum: AppointmentStatus,
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment status updated',
  })
  async updateStatus(
    @Param('id') id: string,
    @Query('status') status: AppointmentStatus,
  ) {
    return this.appointmentsService.updateStatus(id, status);
  }
}
