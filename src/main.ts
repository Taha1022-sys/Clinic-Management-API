import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Clinic Management System API')
    .setDescription(
      'RESTful API documentation for the Clinic Management System. This API provides endpoints for user authentication, patient management, doctor management, and appointments.',
    )
    .setVersion('1.0')
    // 👇 BURASI KRİTİK: Anahtarın adını 'JWT-auth' koyduk.
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // <--- BU İSİM CONTROLLER İLE AYNI OLMAK ZORUNDA
    )
    .addTag('Auth', 'Authentication endpoints for user registration and login')
    .addTag('Users', 'User management endpoints for profile and user operations')
    .addTag('Appointments', 'Appointment booking and management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Clinic Management API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .topbar-wrapper .link {
        content: url('https://nestjs.com/img/logo-small.svg');
        height: 40px;
        width: auto;
      }
      .swagger-ui .topbar { background-color: #E0234E; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // Enable CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN')?.split(',') || [
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Global validation pipe
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

  // Get port from environment
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);

  console.log(`
    🚀 Application is running on:  http://localhost:${port}/${apiPrefix}
    📊 Environment: ${configService.get<string>('NODE_ENV')}
    🗄️  Database: ${configService.get<string>('DB_DATABASE')}
  `);
}
bootstrap();
