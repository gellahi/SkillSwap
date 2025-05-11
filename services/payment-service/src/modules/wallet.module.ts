import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../entities/wallet.entity';
import { WalletService } from '../services/wallet.service';
import { WalletController } from '../controllers/wallet.controller';
import { AuthIntegrationService } from '../services/integration/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet]),
  ],
  controllers: [WalletController],
  providers: [WalletService, AuthIntegrationService],
  exports: [WalletService],
})
export class WalletModule {}
