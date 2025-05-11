import { Module } from '@nestjs/common';
import { WebhookController } from '../controllers/webhook.controller';
import { StripeService } from '../services/providers/stripe.service';
import { TransactionModule } from './transaction.module';
import { WalletModule } from './wallet.module';
import { PaymentMethodModule } from './payment-method.module';
import { WithdrawalModule } from './withdrawal.module';

@Module({
  imports: [
    TransactionModule,
    WalletModule,
    PaymentMethodModule,
    WithdrawalModule,
  ],
  controllers: [WebhookController],
  providers: [StripeService],
})
export class WebhookModule {}
