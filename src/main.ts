import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // 1. CORS'u UYGULAMA OLUŞURKEN AÇIYORUZ (En garanti yöntem)
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true, // Vercel, Localhost ne gelirse kabul et (Production'da da çalışır)
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    },
  });

  // 2. PREFIX'i SABİTLİYORUZ (Hata payı yok)
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  // 3. VALIDATION PIPE
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 4. SWAGGER AYARLARI
  // Prefix olduğu için Swagger: /api/v1/docs adresinde çalışacak
  const config = new DocumentBuilder()
    .setTitle('Clinic Management API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  // Swagger'ı 'docs' yoluna kuruyoruz (Global prefix ile /api/v1/docs olur)
  SwaggerModule.setup('docs', app, document);

  // 5. PORT AYARI
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  console.log(`📄 Swagger is running on: http://localhost:${port}/${globalPrefix}/docs`);
}
bootstrap();
