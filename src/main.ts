import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // 1. Uygulamayı oluştur
  const app = await NestFactory.create(AppModule);

  // 2. CORS'u aç (Wildcard: Herkese izin ver - Debug için)
  app.enableCors({
    origin: true, // Gelen isteği kabul et
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 3. Global Prefix Ayarla (Standart: api/v1)
  app.setGlobalPrefix('api/v1');

  // 4. Swagger Ayarları
  const config = new DocumentBuilder()
    .setTitle('Clinic Management API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // ÖNEMLİ: Swagger yolu prefix'ten etkilenir.
  // Prefix 'api/v1' olduğu için, buraya 'docs' yazarsak adres: /api/v1/docs olur.
  SwaggerModule.setup('docs', app, document); 

  // 5. Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 6. Port ve Başlatma
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();
