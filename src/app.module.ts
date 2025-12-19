import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmAsyncConfig } from './config/src/config/typeorm.config';

// Feature Modules
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { StrapiModule } from './modules/strapi/strapi.module';
import { LeadsModule } from './modules/leads/leads.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';

// Guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // Configuration Module - Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM Module - Database connection
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),

    // Feature modules
    UsersModule,
    AuthModule,
    StrapiModule,
    LeadsModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global JWT Authentication Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Roles Guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
