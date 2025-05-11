import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { WalletStatus, WalletType } from '../entities/wallet.entity';

export class CreateWalletDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsEnum(WalletType)
  type?: WalletType;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateWalletDto {
  @IsOptional()
  @IsEnum(WalletStatus)
  status?: WalletStatus;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
