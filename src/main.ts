import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS: HİÇBİR KISITLAMA YOK (Debug için)
  app.enableCors({
    origin: '*', // Güvenlik falan siktir et, şu an çalışması lazım
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true, // Not: origin '*' iken credentials true bazen patlar ama NestJS halleder.
                       // Eğer hata verirse origin: 'https://clinic-management-ui.vercel.app' yaparız.
  });

  // 2. GLOBAL PREFIX KODUNU SİLDİK. YOK ARTIK.
  // app.setGlobalPrefix(...) -> ÇÖPE ATTIK.

  // 3. SWAGGER
  const config = new DocumentBuilder()
    .setTitle('Clinic Management API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  // Swagger'ı kök dizine değil, elle verdiğimiz yola kuruyoruz
  SwaggerModule.setup('api/v1/docs', app, document); 

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server running on port ${port}`);
  console.log(`📄 Swagger: http://localhost:${port}/api/v1/docs`);
}
bootstrap();
