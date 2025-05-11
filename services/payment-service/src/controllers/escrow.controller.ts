import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { EscrowService } from '../services/escrow.service';
import {
  CreateEscrowDto,
  FundEscrowDto,
  ReleaseMilestoneDto,
  UpdateEscrowStatusDto,
} from '../dto/escrow.dto';
import { AuthGuard } from '../guards/auth.guard';
import { TransactionLoggingInterceptor } from '../interceptors/transaction-logging.interceptor';

@Controller('escrows')
@UseGuards(AuthGuard)
@UseInterceptors(TransactionLoggingInterceptor)
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post()
  async create(@Body() createEscrowDto: CreateEscrowDto, @Request() req) {
    // Only allow admin or client to create escrow
    if (req.user.role !== 'admin' && req.user.role !== 'client') {
      throw new Error('Unauthorized');
    }

    // If not admin, ensure client ID is the current user
    if (req.user.role !== 'admin') {
      createEscrowDto.clientId = req.user.id;
    }

    return this.escrowService.create(createEscrowDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const escrow = await this.escrowService.findOne(id);

    // Only allow admin, client, or freelancer to see escrow
    if (
      req.user.role !== 'admin' &&
      escrow.clientId !== req.user.id &&
      escrow.freelancerId !== req.user.id
    ) {
      throw new Error('Unauthorized');
    }

    return escrow;
  }

  @Get('project/:projectId')
  async findByProjectId(@Param('projectId') projectId: string, @Request() req) {
    const escrows = await this.escrowService.findByProjectId(projectId);

    // Filter escrows based on user role
    if (req.user.role !== 'admin') {
      return escrows.filter(
        (escrow) =>
          escrow.clientId === req.user.id || escrow.freelancerId === req.user.id,
      );
    }

    return escrows;
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateEscrowStatusDto: UpdateEscrowStatusDto,
    @Request() req,
  ) {
    // Only allow admin to update escrow status
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    return this.escrowService.updateStatus(id, updateEscrowStatusDto);
  }

  @Post(':id/fund')
  async fundEscrow(
    @Param('id') id: string,
    @Body() fundEscrowDto: FundEscrowDto,
    @Request() req,
  ) {
    const escrow = await this.escrowService.findOne(id);

    // Only allow admin or client to fund escrow
    if (req.user.role !== 'admin' && escrow.clientId !== req.user.id) {
      throw new Error('Unauthorized');
    }

    return this.escrowService.fundEscrow(id, fundEscrowDto, req.headers.authorization);
  }

  @Post(':id/release-milestone')
  async releaseMilestonePayment(
    @Param('id') id: string,
    @Body() releaseMilestoneDto: ReleaseMilestoneDto,
    @Request() req,
  ) {
    const escrow = await this.escrowService.findOne(id);

    // Only allow admin or client to release milestone payment
    if (req.user.role !== 'admin' && escrow.clientId !== req.user.id) {
      throw new Error('Unauthorized');
    }

    return this.escrowService.releaseMilestonePayment(
      id,
      releaseMilestoneDto,
      req.headers.authorization,
    );
  }
}
