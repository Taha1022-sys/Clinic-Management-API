import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
// import { User } ...  <-- Artık bu import'a bile gerek kalmadı

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
    return {
      type: 'postgres',
      host: configService.get<string>('DB_HOST'),
      port: configService.get<number>('DB_PORT'),
      username: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_DATABASE'),
      
      // 👇 İŞTE SİHİRLİ DOKUNUŞ BURASI!
      // entities: [User], <-- BU SATIRI SİLDİK (Suçlu buydu)
      autoLoadEntities: true, // <-- BUNU EKLEDİK. Artık tüm tabloları otomatik tanır.
      
      migrations: [__dirname + '/../../../database/migrations/*{.ts,.js}'],
      synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
      logging: configService.get<boolean>('DB_LOGGING'),
      ssl: false,
      extra: {
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    };
  },
};

// DataSource for migrations (CLI)
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'clinic_admin',
  password: process.env.DB_PASSWORD || 'clinic_secure_password_2024',
  database: process.env.DB_DATABASE || 'clinic_management_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
