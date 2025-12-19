import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- 1. ADIM: MANUEL OVERRIDE MIDDLEWARE ---
  // NestJS'in kendi CORS'una güvenmiyoruz, kapıyı en tepeden biz açıyoruz.
  app.use((req, res, next) => {
    // Vercel domainini ve localhostu kabul et
    const allowedOrigins = [
      'https://clinic-management-ui.vercel.app',
      'http://localhost:3000'
    ];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', '*'); // Fallback
    }

    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');

    // KRİTİK NOKTA: OPTIONS isteği gelirse router'a gitmeden 200 OK ver ve bitir.
    if (req.method === 'OPTIONS') {
      return res.status(200).send();
    }
    next();
  });

  // --- 2. ADIM: GLOBAL PREFIX ---
  // Railway Variables'tan değil, el ile yazıyoruz ki hata payı kalmasın.
  app.setGlobalPrefix('api/v1');

  // Swagger ve ValidationPipe (Olduğu gibi kalabilir)
  const config = new DocumentBuilder()
    .setTitle('Clinic Management API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true,
    forbidNonWhitelisted: true 
  }));

  // Port ayarı
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
