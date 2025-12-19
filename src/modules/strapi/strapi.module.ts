import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { StrapiService } from './strapi.service';
import { CmsController } from './cms.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  controllers: [CmsController],
  providers: [StrapiService],
  exports: [StrapiService],
})
export class StrapiModule {}
