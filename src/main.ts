import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. ADIM: CORS'u EN BAŞA TAŞIDIK (Preflight isteklerini kaçırmamak için)
  app.enableCors({
    origin: true, // Gelen her güvenli isteği yansıtır, Vercel eşleşme hatasını bitirir.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  const configService = app.get(ConfigService);

  // 2. ADIM: Global Prefix
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // 3. ADIM: Swagger Yapılandırması
  const config = new DocumentBuilder()
    .setTitle('Clinic Management System API')
    .setDescription('RESTful API documentation for the Clinic Management System.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth')
    .addTag('Users')
    .addTag('Appointments')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Clinic Management API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // 4. ADIM: Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 5. ADIM: Port ve Başlatma
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`
    🚀 Application is running on: http://localhost:${port}/${apiPrefix}
    📊 Environment: ${configService.get<string>('NODE_ENV')}
    🗄️  Database: ${configService.get<string>('DB_DATABASE')}
  `);
}
bootstrap();
