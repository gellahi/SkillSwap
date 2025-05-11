import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdrawal } from '../entities/withdrawal.entity';
import { WithdrawalService } from '../services/withdrawal.service';
import { WithdrawalController } from '../controllers/withdrawal.controller';
import { WalletModule } from './wallet.module';
import { PaymentMethodModule } from './payment-method.module';
import { TransactionModule } from './transaction.module';
import { NotificationIntegrationService } from '../services/integration/notification.service';
import { StripeService } from '../services/providers/stripe.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Withdrawal]),
    WalletModule,
    PaymentMethodModule,
    TransactionModule,
  ],
  controllers: [WithdrawalController],
  providers: [
    WithdrawalService,
    NotificationIntegrationService,
    StripeService,
  ],
  exports: [WithdrawalService],
})
export class WithdrawalModule {}
