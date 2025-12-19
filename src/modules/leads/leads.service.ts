import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStatus } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  /**
   * Create a new lead (Public endpoint - no auth)
   */
  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    this.logger.log(`Creating new lead for: ${createLeadDto.email}`);

    const lead = this.leadRepository.create({
      ...createLeadDto,
      status: LeadStatus.NEW,
    });

    const savedLead = await this.leadRepository.save(lead);

    // TODO: Send email notification to admin/sales team
    this.logger.log(`New lead created with ID: ${savedLead.id}`);

    return savedLead;
  }

  /**
   * Get all leads (Admin only)
   */
  async findAll(): Promise<Lead[]> {
    return this.leadRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Get a single lead by ID (Admin only)
   */
  async findOne(id: string): Promise<Lead> {
    return this.leadRepository.findOneOrFail({
      where: { id },
    });
  }

  /**
   * Update lead status (Admin only)
   */
  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    const lead = await this.findOne(id);
    lead.status = status;
    return this.leadRepository.save(lead);
  }
}
