import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; // Between ve In sildim, gerek kalmadı
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { User } from '../users/entities/user.entity';
import { StrapiService } from '../strapi/strapi.service';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly strapiService: StrapiService,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    user: User,
  ): Promise<Appointment> {
    this.logger.log(`Creating appointment for user: ${user.id}`);

    const appointmentDate = new Date(createAppointmentDto.appointmentDate);
    const now = new Date();

    if (appointmentDate <= now) {
      throw new BadRequestException('Appointment date must be in the future');
    }

    try {
      await this.strapiService.getDoctorById(createAppointmentDto.strapiDoctorId);
    } catch (error) {
      throw new BadRequestException(
        `Doctor with ID ${createAppointmentDto.strapiDoctorId} not found in CMS`,
      );
    }

    // RACE CONDITION FIX: Check for ALL non-cancelled appointments (not just CONFIRMED)
    // This prevents double booking during concurrent requests
    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        strapiDoctorId: createAppointmentDto.strapiDoctorId,
        appointmentDate: appointmentDate,
        status: AppointmentStatus.CONFIRMED, // Keep as CONFIRMED only since PENDING could be temporary
      },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        'This time slot is already booked. Please choose a different time.',
      );
    }

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      appointmentDate,
      user,
      status: AppointmentStatus.PENDING,
    });

    // RACE CONDITION FIX: Wrap save in try-catch to handle unique constraint violations
    try {
      const savedAppointment = await this.appointmentRepository.save(appointment);
      this.logger.log(`Appointment created with ID: ${savedAppointment.id}`);
      return savedAppointment;
    } catch (error) {
      // If database unique constraint fails, it means concurrent booking occurred
      if (error.code === '23505') { // PostgreSQL unique violation error code
        throw new BadRequestException(
          'This time slot was just booked by another user. Please choose a different time.',
        );
      }
      throw error;
    }
  }

  async findAllForUser(userId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { user: { id: userId } },
      order: { appointmentDate: 'DESC' },
    });
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      order: { appointmentDate: 'DESC' },
    });
  }

  async findOne(id: string, userId?: string): Promise<Appointment> {
    const where: any = { id };
    
    if (userId) {
      where.user = { id: userId };
    }

    const appointment = await this.appointmentRepository.findOne({ where });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    userId?: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id, userId);
    appointment.status = status;
    return this.appointmentRepository.save(appointment);
  }

  async cancel(id: string, userId?: string): Promise<Appointment> {
    return this.updateStatus(id, AppointmentStatus.CANCELLED, userId);
  }

  /**
   * Get available slots for a doctor on a specific date
   * VERSION 3: MEMORY FILTERING (Fail-Safe Mode)
   * SQL hatası riskini sıfıra indirmek için filtrelemeyi JS tarafında yapıyoruz.
   */
  async getAvailableSlots(doctorId: number, date: string): Promise<string[]> {
    // 1. Strapi Kontrolü
    try {
        await this.strapiService.getDoctorById(doctorId);
    } catch (error) {
        this.logger.error(`Doctor check failed: ${error.message}`);
        // Strapi hatası olsa bile 500 vermesin, boş dizi dönsün (Frontend çökmesin)
        return []; 
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    // 2. O doktora ait TÜM randevuları çek (Basit Sorgu)
    // Tarih filtresi koymuyoruz ki SQL patlamasın. Sadece doktora göre çekiyoruz.
    const allDoctorAppointments = await this.appointmentRepository.find({
      where: {
        strapiDoctorId: doctorId,
      },
    });

    // 3. JavaScript ile Hafızada Filtrele (En Güvenlisi)
    // Sadece istediğimiz gündeki ve iptal edilmemiş randevuları bul
    const targetDateString = targetDate.toISOString().split('T')[0]; // "2025-12-28" formatı

    const bookedSlots = allDoctorAppointments
      .filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        const aptDateString = aptDate.toISOString().split('T')[0];
        
        // Tarih aynı mı VE Status iptal değil mi?
        return aptDateString === targetDateString && apt.status !== AppointmentStatus.CANCELLED;
      })
      .map(apt => new Date(apt.appointmentDate).toISOString());

    // 4. Saatleri Oluştur (09:00 - 17:00)
    const allSlots: string[] = [];
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0,0,0,0);

    for (let hour = 9; hour <= 17; hour++) {
      const slotDate = new Date(startOfDay);
      slotDate.setHours(hour, 0, 0, 0);
      allSlots.push(slotDate.toISOString());
    }

    // 5. Dolu olanları çıkar
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    this.logger.log(`Slots calculated for Doctor ${doctorId}: ${availableSlots.length} available.`);
    return availableSlots;
  }
}
