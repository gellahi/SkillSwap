import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { TransactionService } from '../services/transaction.service';
import { TransactionController } from '../controllers/transaction.controller';
import { WalletModule } from './wallet.module';
import { NotificationIntegrationService } from '../services/integration/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    WalletModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService, NotificationIntegrationService],
  exports: [TransactionService],
})
export class TransactionModule {}
