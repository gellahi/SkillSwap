import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { PaymentMethodService } from '../services/payment-method.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from '../dto/payment-method.dto';
import { AuthGuard } from '../guards/auth.guard';
import { TransactionLoggingInterceptor } from '../interceptors/transaction-logging.interceptor';

@Controller('payment-methods')
@UseGuards(AuthGuard)
@UseInterceptors(TransactionLoggingInterceptor)
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  async create(@Body() createPaymentMethodDto: CreatePaymentMethodDto, @Request() req) {
    // Only allow admin to create payment methods for other users
    if (req.user.role !== 'admin' && createPaymentMethodDto.userId !== req.user.id) {
      createPaymentMethodDto.userId = req.user.id;
    }

    return this.paymentMethodService.create(createPaymentMethodDto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.paymentMethodService.findByUserId(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const paymentMethod = await this.paymentMethodService.findOne(id);

    // Only allow admin or payment method owner to see payment method
    if (req.user.role !== 'admin' && paymentMethod.userId !== req.user.id) {
      throw new Error('Unauthorized');
    }

    return paymentMethod;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
    @Request() req,
  ) {
    const paymentMethod = await this.paymentMethodService.findOne(id);

    // Only allow admin or payment method owner to update payment method
    if (req.user.role !== 'admin' && paymentMethod.userId !== req.user.id) {
      throw new Error('Unauthorized');
    }

    return this.paymentMethodService.update(id, updatePaymentMethodDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const paymentMethod = await this.paymentMethodService.findOne(id);

    // Only allow admin or payment method owner to delete payment method
    if (req.user.role !== 'admin' && paymentMethod.userId !== req.user.id) {
      throw new Error('Unauthorized');
    }

    return this.paymentMethodService.remove(id);
  }

  @Get('default')
  async getDefaultPaymentMethod(@Request() req) {
    return this.paymentMethodService.getDefaultPaymentMethod(req.user.id);
  }

  @Post(':id/verify-stripe')
  async verifyStripePaymentMethod(
    @Param('id') id: string,
    @Body('stripePaymentMethodId') stripePaymentMethodId: string,
    @Request() req,
  ) {
    const paymentMethod = await this.paymentMethodService.findOne(id);

    // Only allow admin or payment method owner to verify payment method
    if (req.user.role !== 'admin' && paymentMethod.userId !== req.user.id) {
      throw new Error('Unauthorized');
    }

    return this.paymentMethodService.verifyStripePaymentMethod(id, stripePaymentMethodId);
  }
}
