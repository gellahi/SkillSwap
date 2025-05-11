import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { Escrow } from './escrow.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  ESCROW_FUNDING = 'escrow_funding',
  MILESTONE_PAYMENT = 'milestone_payment',
  REFUND = 'refund',
  PLATFORM_FEE = 'platform_fee',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fee: number;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  sourceWalletId: string;

  @ManyToOne(() => Wallet, { nullable: true })
  @JoinColumn({ name: 'sourceWalletId' })
  sourceWallet: Wallet;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  destinationWalletId: string;

  @ManyToOne(() => Wallet, { nullable: true })
  @JoinColumn({ name: 'destinationWalletId' })
  destinationWallet: Wallet;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  escrowId: string;

  @ManyToOne(() => Escrow, { nullable: true })
  @JoinColumn({ name: 'escrowId' })
  escrow: Escrow;

  @Column({ type: 'uuid', nullable: true })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  milestoneId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  externalReference: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
