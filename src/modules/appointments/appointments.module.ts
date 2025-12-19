import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { StrapiModule } from '../strapi/strapi.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]), // Metadata hatasını çözen satır
    StrapiModule, // Strapi servisini kullanmak için şart
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
