import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { EscrowStatus } from '../entities/escrow.entity';

class MilestoneDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsEnum(['pending', 'in-progress', 'completed', 'approved'])
  status: 'pending' | 'in-progress' | 'completed' | 'approved';

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  releasedAt?: Date;
}

export class CreateEscrowDto {
  @IsUUID()
  projectId: string;

  @IsUUID()
  clientId: string;

  @IsUUID()
  freelancerId: string;

  @IsNumber()
  @Min(0.01)
  totalAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones: MilestoneDto[];

  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateEscrowStatusDto {
  @IsEnum(EscrowStatus)
  status: EscrowStatus;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class FundEscrowDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

export class ReleaseMilestoneDto {
  @IsUUID()
  milestoneId: string;
}
