import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS: Herkese Açık (Debug Modu)
  app.enableCors({
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Global Prefix: api/v1
  // Tüm endpointlerin (Login, Register vs.) başına api/v1 ekler.
  app.setGlobalPrefix('api/v1');

  // 3. Swagger Ayarları
  const config = new DocumentBuilder()
    .setTitle('Clinic Management API')
    .setDescription('MediFlow API Documentation')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // 4. SWAGGER KURULUMU (Kritik Nokta)
  // useGlobalPrefix: false diyerek Swagger'ı prefix belasından kurtarıyoruz.
  // Swagger Adresi: DOMAIN/docs olacak.
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: false, 
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server running on port ${port}`);
  console.log(`📄 Swagger UI: ${await app.getUrl()}/docs`);
}
bootstrap();
