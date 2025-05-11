import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { WithdrawalService } from '../services/withdrawal.service';
import { CreateWithdrawalDto, WithdrawalFilterDto } from '../dto/withdrawal.dto';
import { AuthGuard } from '../guards/auth.guard';
import { TransactionLoggingInterceptor } from '../interceptors/transaction-logging.interceptor';

@Controller('withdrawals')
@UseGuards(AuthGuard)
@UseInterceptors(TransactionLoggingInterceptor)
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post()
  async create(@Body() createWithdrawalDto: CreateWithdrawalDto, @Request() req) {
    // Only allow admin to create withdrawals for other users
    if (req.user.role !== 'admin' && createWithdrawalDto.userId !== req.user.id) {
      createWithdrawalDto.userId = req.user.id;
    }

    return this.withdrawalService.create(createWithdrawalDto);
  }

  @Get()
  async findAll(@Query() filterDto: WithdrawalFilterDto, @Request() req) {
    // Only allow admin to see all withdrawals
    if (req.user.role !== 'admin') {
      filterDto.userId = req.user.id;
    }

    return this.withdrawalService.findAll(filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const withdrawal = await this.withdrawalService.findOne(id);

    // Only allow admin or withdrawal owner to see withdrawal
    if (req.user.role !== 'admin' && withdrawal.userId !== req.user.id) {
      throw new Error('Unauthorized');
    }

    return withdrawal;
  }

  @Post(':id/process')
  async processWithdrawal(@Param('id') id: string, @Request() req) {
    // Only allow admin to process withdrawal
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    return this.withdrawalService.processWithdrawal(id);
  }

  @Post(':id/cancel')
  async cancelWithdrawal(@Param('id') id: string, @Request() req) {
    const withdrawal = await this.withdrawalService.findOne(id);

    // Only allow admin or withdrawal owner to cancel withdrawal
    if (req.user.role !== 'admin' && withdrawal.userId !== req.user.id) {
      throw new Error('Unauthorized');
    }

    return this.withdrawalService.cancelWithdrawal(id);
  }
}
