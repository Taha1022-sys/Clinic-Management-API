import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // 1. Create app with CORS enabled at the factory level
  const app = await NestFactory.create(AppModule, {
    cors: true, // Enable CORS before any routing
  });

  // 2. Set global prefix FIRST (before any middleware or configuration)
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix, {
    exclude: [], // Don't exclude anything from the prefix
  });

  // 3. Configure CORS middleware AFTER prefix is set
  // This ensures CORS is applied to ALL prefixed routes
  app.enableCors({
    origin: true, // In production, replace with your Vercel domain
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false, // Don't pass OPTIONS to route handlers
    optionsSuccessStatus: 204, // Standard preflight response
  });

  // 4. Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted:  true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 5. Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Clinic Management API')
    .setDescription('API Documentation for Clinic Management System')
    .setVersion('1.0')
    .addServer(`/${globalPrefix}`, 'API v1') // Add server with prefix
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Setup Swagger at /api/v1/docs (respecting the global prefix)
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
    customSiteTitle: 'Clinic API Docs',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customCss: '. swagger-ui .topbar { display: none }',
  });

  // 6. Port configuration
  const port = process. env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`\n🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  console.log(`📄 Swagger docs available at: http://localhost:${port}/${globalPrefix}/docs`);
  console.log(`🌍 CORS is enabled for all origins (configure for production! )\n`);
}

bootstrap();
