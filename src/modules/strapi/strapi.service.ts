import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface StrapiDoctor {
  id: number;
  documentId: string;
  Fullname: string; // Matches Strapi schema field name
  Title?: string; // Doctor's professional title
  Branch?: string; // Specialty/Branch (e.g., 'Hair Transplant', 'Dental', 'Plastic Surgery')
  Biography?: any; // Strapi blocks type (markdown/rich text)
  Experience?: number; // Years of experience
  Price?: number; // Consultation or service price
  contact_email?: string; // Doctor's contact email
  is_active?: boolean; // Whether doctor is currently available
  image?: any; // Doctor's photo/avatar
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
}

export interface StrapiTreatment {
  id: number;
  documentId: string;
  name: string;
  description?: string;
  price?: number;
  duration?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
}

@Injectable()
export class StrapiService {
  private readonly logger = new Logger(StrapiService.name);
  private readonly strapiUrl: string;
  private readonly strapiToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.strapiUrl = this.configService.get<string>('STRAPI_API_URL') || 'http://localhost:1337';
    this.strapiToken = this.configService.get<string>('STRAPI_API_TOKEN') || '';

    if (!this.strapiToken) {
      this.logger.warn('STRAPI_API_TOKEN is not set. Strapi requests may fail.');
    }
  }

  /**
   * Get headers with authorization token
   */
  private getHeaders() {
    return {
      Authorization: `Bearer ${this.strapiToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Fetch all doctors from Strapi
   * Includes all fields: Fullname, Title, Branch, Biography, Experience, Price, is_active
   */
  async getDoctors(): Promise<StrapiDoctor[]> {
    try {
      const url = `${this.strapiUrl}/api/doctors`;
      this.logger.log(`Fetching doctors from Strapi: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
          params: {
            populate: '*', // Populate all relations
            fields: ['Fullname', 'Title', 'Branch', 'Biography', 'Experience', 'Price', 'contact_email', 'is_active'], // Explicitly request all fields
          },
        }),
      );

      const doctors = response.data.data || [];
      this.logger.log(`Successfully fetched ${doctors.length} doctors from Strapi`);
      return doctors;
    } catch (error) {
      this.logger.error('Failed to fetch doctors from Strapi', error.message);
      throw new HttpException(
        'Unable to fetch doctors from CMS',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Fetch a single doctor by ID from Strapi (Updated for Strapi v5)
   * Uses filtering instead of direct ID access
   * Includes all fields: Fullname, Title, Branch, Biography, Experience, Price, is_active
   */
  async getDoctorById(id: number): Promise<StrapiDoctor> {
    try {
      // DİKKAT: URL'in sonuna /id eklemiyoruz. Ana endpoint'e istek atıyoruz.
      const url = `${this.strapiUrl}/api/doctors`; 
      this.logger.log(`Fetching doctor with ID ${id} from Strapi using Filter`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
          params: {
            populate: '*', // Populate all relations
            fields: ['Fullname', 'Title', 'Branch', 'Biography', 'Experience', 'Price', 'contact_email', 'is_active'], // Explicitly request all fields
            'filters[id][$eq]': id, // Filter by ID
          },
        }),
      );

      const doctors = response.data.data;

      // Eğer dizi boşsa veya undefined ise doktor bulunamadı demektir
      if (!doctors || doctors.length === 0) {
        this.logger.warn(`Doctor with ID ${id} not found in Strapi results.`);
        throw new HttpException('Doctor not found in CMS', HttpStatus.NOT_FOUND);
      }

      // İlk elemanı döndür
      const doctor = doctors[0];
      this.logger.log(`Successfully fetched doctor: ${doctor.Fullname} (ID: ${id})`);
      return doctor;

    } catch (error) {
      this.logger.error(`Failed to fetch doctor ${id} from Strapi`, error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Unable to fetch doctor from CMS',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Fetch all treatments from Strapi
   */
  async getTreatments(): Promise<StrapiTreatment[]> {
    try {
      const url = `${this.strapiUrl}/api/treatments`;
      this.logger.log(`Fetching treatments from Strapi: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
          params: {
            populate: '*',
          },
        }),
      );

      return response.data.data || [];
    } catch (error) {
      this.logger.error('Failed to fetch treatments from Strapi', error.message);
      throw new HttpException(
        'Unable to fetch treatments from CMS',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Fetch a single treatment by ID from Strapi (Updated for Strapi v5)
   */
  async getTreatmentById(id: number): Promise<StrapiTreatment> {
    try {
      const url = `${this.strapiUrl}/api/treatments`; // URL düzeltildi
      this.logger.log(`Fetching treatment with ID ${id} from Strapi using Filter`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
          params: {
            populate: '*',
            'filters[id][$eq]': id, // Aynı filtreleme mantığı
          },
        }),
      );

      const treatments = response.data.data;

      if (!treatments || treatments.length === 0) {
        throw new HttpException('Treatment not found in CMS', HttpStatus.NOT_FOUND);
      }

      return treatments[0];

    } catch (error) {
      this.logger.error(`Failed to fetch treatment ${id} from Strapi`, error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Unable to fetch treatment from CMS',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
