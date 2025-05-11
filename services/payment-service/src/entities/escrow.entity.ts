import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Transaction } from './transaction.entity';

export enum EscrowStatus {
  PENDING = 'pending',
  FUNDED = 'funded',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

@Entity('escrows')
export class Escrow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  projectId: string;

  @Column({ type: 'uuid' })
  @Index()
  clientId: string;

  @Column({ type: 'uuid' })
  @Index()
  freelancerId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fundedAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  releasedAmount: number;

  @Column({
    type: 'enum',
    enum: EscrowStatus,
    default: EscrowStatus.PENDING,
  })
  status: EscrowStatus;

  @Column({ type: 'jsonb', default: [] })
  milestones: {
    id: string;
    title: string;
    amount: number;
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed' | 'approved';
    releasedAt?: Date;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Transaction, (transaction) => transaction.escrow)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
