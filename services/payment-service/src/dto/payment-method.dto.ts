import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethodStatus, PaymentMethodType } from '../entities/payment-method.entity';

export class CreatePaymentMethodDto {
  @IsUUID()
  userId: string;

  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  details?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdatePaymentMethodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PaymentMethodStatus)
  status?: PaymentMethodStatus;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  details?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  metadata?: Record<string, any>;
}
