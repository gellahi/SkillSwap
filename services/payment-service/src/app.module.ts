import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

// Import modules
import { TransactionModule } from './modules/transaction.module';
import { EscrowModule } from './modules/escrow.module';
import { WalletModule } from './modules/wallet.module';
import { PaymentMethodModule } from './modules/payment-method.module';
import { WithdrawalModule } from './modules/withdrawal.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        ssl: configService.get('NODE_ENV') === 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
    
    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        publicKey: configService.get('JWT_PUBLIC_KEY'),
        verifyOptions: {
          algorithms: ['RS256'],
        },
      }),
    }),
    
    // Feature modules
    TransactionModule,
    EscrowModule,
    WalletModule,
    PaymentMethodModule,
    WithdrawalModule,
  ],
})
export class AppModule {}
