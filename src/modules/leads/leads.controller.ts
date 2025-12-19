import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit a new lead inquiry (Public)',
    description:
      'Public endpoint for landing pages. No authentication required. Creates a new lead record.',
  })
  @ApiResponse({
    status: 201,
    description: 'Lead successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all leads (Admin only)',
    description: 'Retrieve all lead inquiries. Admin access required.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all leads',
  })
  async findAll() {
    return this.leadsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a single lead by ID (Admin only)',
    description: 'Retrieve details of a specific lead. Admin access required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead details',
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  async findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }
}
