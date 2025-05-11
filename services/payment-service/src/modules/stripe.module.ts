import { Module } from '@nestjs/common';
import { StripeController } from '../controllers/stripe.controller';
import { StripeService } from '../services/providers/stripe.service';
import { PaymentMethodModule } from './payment-method.module';

@Module({
  imports: [PaymentMethodModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
