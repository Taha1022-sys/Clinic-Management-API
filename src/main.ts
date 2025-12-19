import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. ADIM: MANUEL CORS VE OPTIONS YÖNETİMİ (En güvenli yol)
  // Bu middleware, NestJS router'ına girmeden önce OPTIONS isteğini yakalar ve onaylar.
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Gelen isteğin origin'ini kabul et (Vercel domainini otomatik tanır)
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Eğer gelen istek bir OPTIONS (Preflight) isteği ise, 204 dön ve bitir.
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  const configService = app.get(ConfigService);

  // 2. ADIM: Global Prefix
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Swagger Konfigürasyonu
  const config = new DocumentBuilder()
    .setTitle('Clinic Management System API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Validation Pipe
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true,
    forbidNonWhitelisted: true 
  }));

  // Port Ayarı
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 API is running on port ${port} with prefix ${apiPrefix}`);
}
bootstrap();
