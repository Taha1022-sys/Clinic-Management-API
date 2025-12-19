import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // 1. UYGULAMAYI OLUŞTURURKEN CORS'U AKTİF ET
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }
  });

  // 2. GLOBAL PREFIX'İ ELİNLE YAZ (Hata payını silmek için)
  app.setGlobalPrefix('api/v1');

  // 3. SWAGGER (Aynı kalabilir)
  const config = new DocumentBuilder()
    .setTitle('Clinic Management API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 4. VALIDATION
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 5. PORT AYARI (Railway'in verdiği PORT değişkenini al)
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // 0.0.0.0 dış dünyaya açılmasını garantiler

  console.log(`🚀 API yayında: Port ${port} | Prefix: api/v1`);
}
bootstrap();
