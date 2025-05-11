import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import {
  CreateTransactionDto,
  TransactionFilterDto,
  UpdateTransactionStatusDto,
} from '../dto/transaction.dto';
import { AuthGuard } from '../guards/auth.guard';
import { TransactionLoggingInterceptor } from '../interceptors/transaction-logging.interceptor';

@Controller('transactions')
@UseGuards(AuthGuard)
@UseInterceptors(TransactionLoggingInterceptor)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    // Only allow admin to create transactions for other users
    if (req.user.role !== 'admin' && createTransactionDto.userId !== req.user.id) {
      createTransactionDto.userId = req.user.id;
    }

    return this.transactionService.create(createTransactionDto);
  }

  @Get()
  async findAll(@Query() filterDto: TransactionFilterDto, @Request() req) {
    // Only allow admin to see all transactions
    if (req.user.role !== 'admin') {
      filterDto.userId = req.user.id;
    }

    return this.transactionService.findAll(filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const transaction = await this.transactionService.findOne(id);

    // Only allow admin or transaction owner to see transaction
    if (req.user.role !== 'admin' && transaction.userId !== req.user.id) {
      throw new Error('Unauthorized');
    }

    return transaction;
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateTransactionStatusDto: UpdateTransactionStatusDto,
    @Request() req,
  ) {
    // Only allow admin to update transaction status
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    return this.transactionService.updateStatus(id, updateTransactionStatusDto);
  }
}
