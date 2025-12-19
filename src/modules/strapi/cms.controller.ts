import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { StrapiService, StrapiDoctor, StrapiTreatment } from '../strapi/strapi.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('CMS Content')
@Controller('cms')
export class CmsController {
  constructor(private readonly strapiService: StrapiService) {}

  /**
   * Get all doctors from Strapi CMS
   * PUBLIC endpoint - no authentication required
   */
  @Get('doctors')
  @Public()
  @ApiOperation({
    summary: 'Get all doctors',
    description:
      'Fetch all doctors from Strapi CMS including their biography, experience, price, and availability status. This is a public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of doctors retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          documentId: { type: 'string', example: 'abc123' },
          Fullname: { type: 'string', example: 'Dr. John Smith' },
          Title: { type: 'string', example: 'Senior Consultant' },
          Branch: {
            type: 'string',
            example: 'Hair Transplant',
            enum: ['Hair Transplant', 'Dental', 'Plastic Surgery'],
          },
          Biography: { type: 'object', description: 'Rich text biography (markdown)' },
          Experience: { type: 'number', example: 15 },
          Price: { type: 'number', example: 2500 },
          contact_email: { type: 'string', example: 'dr.smith@clinic.com' },
          is_active: { type: 'boolean', example: true },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Unable to fetch doctors from CMS',
  })
  async getDoctors(): Promise<StrapiDoctor[]> {
    return this.strapiService.getDoctors();
  }

  /**
   * Get a specific doctor by ID
   * PUBLIC endpoint - no authentication required
   */
  @Get('doctors/:id')
  @Public()
  @ApiOperation({
    summary: 'Get doctor by ID',
    description:
      'Fetch detailed information about a specific doctor from Strapi CMS. This is a public endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Doctor ID from Strapi',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor not found in CMS',
  })
  @ApiResponse({
    status: 503,
    description: 'Unable to fetch doctor from CMS',
  })
  async getDoctorById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StrapiDoctor> {
    return this.strapiService.getDoctorById(id);
  }

  /**
   * Get all treatments from Strapi CMS
   * PUBLIC endpoint - no authentication required
   */
  @Get('treatments')
  @Public()
  @ApiOperation({
    summary: 'Get all treatments',
    description:
      'Fetch all available treatments from Strapi CMS. This is a public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of treatments retrieved successfully',
  })
  @ApiResponse({
    status: 503,
    description: 'Unable to fetch treatments from CMS',
  })
  async getTreatments(): Promise<StrapiTreatment[]> {
    return this.strapiService.getTreatments();
  }

  /**
   * Get a specific treatment by ID
   * PUBLIC endpoint - no authentication required
   */
  @Get('treatments/:id')
  @Public()
  @ApiOperation({
    summary: 'Get treatment by ID',
    description:
      'Fetch detailed information about a specific treatment from Strapi CMS. This is a public endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Treatment ID from Strapi',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Treatment retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Treatment not found in CMS',
  })
  @ApiResponse({
    status: 503,
    description: 'Unable to fetch treatment from CMS',
  })
  async getTreatmentById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StrapiTreatment> {
    return this.strapiService.getTreatmentById(id);
  }
}
