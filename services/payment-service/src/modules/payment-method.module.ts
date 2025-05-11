import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentMethodService } from '../services/payment-method.service';
import { PaymentMethodController } from '../controllers/payment-method.controller';
import { StripeService } from '../services/providers/stripe.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentMethod]),
  ],
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService, StripeService],
  exports: [PaymentMethodService],
})
export class PaymentMethodModule {}
