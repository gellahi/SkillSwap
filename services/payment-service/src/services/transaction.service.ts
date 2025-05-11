import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction, TransactionStatus, TransactionType } from '../entities/transaction.entity';
import { CreateTransactionDto, TransactionFilterDto, UpdateTransactionStatusDto } from '../dto/transaction.dto';
import { WalletService } from './wallet.service';
import { NotificationIntegrationService } from './integration/notification.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private walletService: WalletService,
    private notificationService: NotificationIntegrationService,
  ) {}

  /**
   * Create a new transaction
   * @param createTransactionDto Transaction data
   * @returns Created transaction
   */
  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    try {
      const transaction = this.transactionRepository.create(createTransactionDto);
      
      // Save transaction
      const savedTransaction = await this.transactionRepository.save(transaction);
      
      // Update wallet balances if transaction is completed
      if (transaction.status === TransactionStatus.COMPLETED) {
        await this.updateWalletBalances(transaction);
      }
      
      // Send notification
      await this.sendTransactionNotification(savedTransaction);
      
      return savedTransaction;
    } catch (error) {
      this.logger.error(`Failed to create transaction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all transactions with filters
   * @param filterDto Filter criteria
   * @returns Transactions
   */
  async findAll(filterDto: TransactionFilterDto): Promise<{ data: Transaction[]; total: number }> {
    try {
      const { 
        userId, 
        type, 
        status, 
        projectId, 
        escrowId, 
        startDate, 
        endDate,
        page = 1,
        limit = 10
      } = filterDto;
      
      const queryBuilder = this.transactionRepository.createQueryBuilder('transaction');
      
      // Apply filters
      if (userId) {
        queryBuilder.andWhere('transaction.userId = :userId', { userId });
      }
      
      if (type) {
        queryBuilder.andWhere('transaction.type = :type', { type });
      }
      
      if (status) {
        queryBuilder.andWhere('transaction.status = :status', { status });
      }
      
      if (projectId) {
        queryBuilder.andWhere('transaction.projectId = :projectId', { projectId });
      }
      
      if (escrowId) {
        queryBuilder.andWhere('transaction.escrowId = :escrowId', { escrowId });
      }
      
      if (startDate && endDate) {
        queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        });
      } else if (startDate) {
        queryBuilder.andWhere('transaction.createdAt >= :startDate', {
          startDate: new Date(startDate),
        });
      } else if (endDate) {
        queryBuilder.andWhere('transaction.createdAt <= :endDate', {
          endDate: new Date(endDate),
        });
      }
      
      // Add pagination
      queryBuilder
        .orderBy('transaction.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);
      
      // Get results
      const [transactions, total] = await queryBuilder.getManyAndCount();
      
      return { data: transactions, total };
    } catch (error) {
      this.logger.error(`Failed to find transactions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find transaction by ID
   * @param id Transaction ID
   * @returns Transaction
   */
  async findOne(id: string): Promise<Transaction> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { id },
        relations: ['sourceWallet', 'destinationWallet', 'escrow'],
      });
      
      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }
      
      return transaction;
    } catch (error) {
      this.logger.error(`Failed to find transaction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update transaction status
   * @param id Transaction ID
   * @param updateTransactionStatusDto Update data
   * @returns Updated transaction
   */
  async updateStatus(
    id: string,
    updateTransactionStatusDto: UpdateTransactionStatusDto,
  ): Promise<Transaction> {
    try {
      const transaction = await this.findOne(id);
      
      // Update transaction
      const updatedTransaction = Object.assign(transaction, updateTransactionStatusDto);
      
      // Save transaction
      const savedTransaction = await this.transactionRepository.save(updatedTransaction);
      
      // Update wallet balances if transaction is completed
      if (
        transaction.status !== TransactionStatus.COMPLETED &&
        updatedTransaction.status === TransactionStatus.COMPLETED
      ) {
        await this.updateWalletBalances(updatedTransaction);
      }
      
      // Send notification
      await this.sendTransactionNotification(savedTransaction);
      
      return savedTransaction;
    } catch (error) {
      this.logger.error(`Failed to update transaction status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update wallet balances based on transaction
   * @param transaction Transaction
   */
  private async updateWalletBalances(transaction: Transaction): Promise<void> {
    try {
      // Handle different transaction types
      switch (transaction.type) {
        case TransactionType.DEPOSIT:
          if (transaction.destinationWalletId) {
            await this.walletService.incrementBalance(
              transaction.destinationWalletId,
              transaction.amount,
            );
          }
          break;
          
        case TransactionType.WITHDRAWAL:
          if (transaction.sourceWalletId) {
            await this.walletService.decrementBalance(
              transaction.sourceWalletId,
              transaction.amount,
            );
          }
          break;
          
        case TransactionType.ESCROW_FUNDING:
          if (transaction.sourceWalletId) {
            await this.walletService.decrementBalance(
              transaction.sourceWalletId,
              transaction.amount,
            );
          }
          break;
          
        case TransactionType.MILESTONE_PAYMENT:
          if (transaction.destinationWalletId) {
            await this.walletService.incrementBalance(
              transaction.destinationWalletId,
              transaction.amount - transaction.fee,
            );
          }
          break;
          
        case TransactionType.REFUND:
          if (transaction.destinationWalletId) {
            await this.walletService.incrementBalance(
              transaction.destinationWalletId,
              transaction.amount,
            );
          }
          break;
          
        case TransactionType.PLATFORM_FEE:
          // Platform fees are handled separately
          break;
          
        default:
          this.logger.warn(`Unknown transaction type: ${transaction.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to update wallet balances: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send transaction notification
   * @param transaction Transaction
   */
  private async sendTransactionNotification(transaction: Transaction): Promise<void> {
    try {
      // Skip notification for platform fee transactions
      if (transaction.type === TransactionType.PLATFORM_FEE) {
        return;
      }
      
      let title = '';
      let message = '';
      
      // Set notification title and message based on transaction type and status
      switch (transaction.type) {
        case TransactionType.DEPOSIT:
          title = 'Deposit';
          message = transaction.status === TransactionStatus.COMPLETED
            ? `Your deposit of $${transaction.amount} has been completed.`
            : `Your deposit of $${transaction.amount} is ${transaction.status}.`;
          break;
          
        case TransactionType.WITHDRAWAL:
          title = 'Withdrawal';
          message = transaction.status === TransactionStatus.COMPLETED
            ? `Your withdrawal of $${transaction.amount} has been completed.`
            : `Your withdrawal of $${transaction.amount} is ${transaction.status}.`;
          break;
          
        case TransactionType.ESCROW_FUNDING:
          title = 'Escrow Funding';
          message = transaction.status === TransactionStatus.COMPLETED
            ? `Your escrow funding of $${transaction.amount} has been completed.`
            : `Your escrow funding of $${transaction.amount} is ${transaction.status}.`;
          break;
          
        case TransactionType.MILESTONE_PAYMENT:
          title = 'Milestone Payment';
          message = transaction.status === TransactionStatus.COMPLETED
            ? `You have received a milestone payment of $${transaction.amount - transaction.fee}.`
            : `Your milestone payment of $${transaction.amount} is ${transaction.status}.`;
          break;
          
        case TransactionType.REFUND:
          title = 'Refund';
          message = transaction.status === TransactionStatus.COMPLETED
            ? `Your refund of $${transaction.amount} has been completed.`
            : `Your refund of $${transaction.amount} is ${transaction.status}.`;
          break;
          
        default:
          title = 'Transaction Update';
          message = `Your transaction of $${transaction.amount} is ${transaction.status}.`;
      }
      
      // Send notification
      await this.notificationService.sendInAppNotification(
        transaction.userId,
        title,
        message,
        'transaction',
        {
          transactionId: transaction.id,
          type: transaction.type,
          status: transaction.status,
          amount: transaction.amount,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to send transaction notification: ${error.message}`);
      // Don't throw error, just log it
    }
  }
}
