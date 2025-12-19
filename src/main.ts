import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS'u Aç (Standart Yöntem)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Prefix Ayarla
  app.setGlobalPrefix('api/v1');

  // 3. Swagger
  const config = new DocumentBuilder()
    .setTitle('Clinic Management API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // Adres: /api/v1/docs olur

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 4. Port (Değişkeni yoksa 3000 kullan)
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
