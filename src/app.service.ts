import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Clinic Management System API - v1.0.0';
  }
}
