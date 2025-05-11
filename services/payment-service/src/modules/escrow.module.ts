import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Escrow } from '../entities/escrow.entity';
import { EscrowService } from '../services/escrow.service';
import { EscrowController } from '../controllers/escrow.controller';
import { TransactionModule } from './transaction.module';
import { WalletModule } from './wallet.module';
import { ProjectIntegrationService } from '../services/integration/project.service';
import { NotificationIntegrationService } from '../services/integration/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Escrow]),
    TransactionModule,
    WalletModule,
  ],
  controllers: [EscrowController],
  providers: [EscrowService, ProjectIntegrationService, NotificationIntegrationService],
  exports: [EscrowService],
})
export class EscrowModule {}
