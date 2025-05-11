import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Withdrawal, WithdrawalStatus } from '../entities/withdrawal.entity';
import { CreateWithdrawalDto, UpdateWithdrawalStatusDto, WithdrawalFilterDto } from '../dto/withdrawal.dto';
import { WalletService } from './wallet.service';
import { PaymentMethodService } from './payment-method.service';
import { TransactionService } from './transaction.service';
import { NotificationIntegrationService } from './integration/notification.service';
import { TransactionStatus, TransactionType } from '../entities/transaction.entity';
import { ConfigService } from '@nestjs/config';
import { PaymentMethodType } from '../entities/payment-method.entity';
import { StripeService } from './providers/stripe.service';

@Injectable()
export class WithdrawalService {
  private readonly logger = new Logger(WithdrawalService.name);
  private readonly withdrawalFeePercentage: number;
  private readonly minimumWithdrawalAmount: number;

  constructor(
    @InjectRepository(Withdrawal)
    private withdrawalRepository: Repository<Withdrawal>,
    private walletService: WalletService,
    private paymentMethodService: PaymentMethodService,
    private transactionService: TransactionService,
    private notificationService: NotificationIntegrationService,
    private configService: ConfigService,
    private stripeService: StripeService,
  ) {
    this.withdrawalFeePercentage = parseFloat(
      this.configService.get<string>('WITHDRAWAL_FEE_PERCENTAGE', '2.5'),
    );
    this.minimumWithdrawalAmount = parseFloat(
      this.configService.get<string>('MINIMUM_WITHDRAWAL_AMOUNT', '50'),
    );
  }

  /**
   * Create a new withdrawal request
   * @param createWithdrawalDto Withdrawal data
   * @returns Created withdrawal
   */
  async create(createWithdrawalDto: CreateWithdrawalDto): Promise<Withdrawal> {
    try {
      // Check if amount is above minimum
      if (createWithdrawalDto.amount < this.minimumWithdrawalAmount) {
        throw new Error(`Withdrawal amount must be at least $${this.minimumWithdrawalAmount}`);
      }

      // Get user wallet
      const wallet = await this.walletService.findByUserId(createWithdrawalDto.userId);

      // Check if user has sufficient balance
      if (wallet.availableBalance < createWithdrawalDto.amount) {
        throw new Error('Insufficient balance');
      }

      // Get payment method
      const paymentMethod = await this.paymentMethodService.findOne(
        createWithdrawalDto.paymentMethodId,
      );

      // Calculate fee
      const fee = (createWithdrawalDto.amount * this.withdrawalFeePercentage) / 100;
      const netAmount = createWithdrawalDto.amount - fee;

      // Create withdrawal
      const withdrawal = this.withdrawalRepository.create({
        ...createWithdrawalDto,
        fee,
        netAmount,
        status: WithdrawalStatus.PENDING,
      });

      // Save withdrawal
      const savedWithdrawal = await this.withdrawalRepository.save(withdrawal);

      // Reserve the amount in the wallet
      await this.walletService.update(wallet.id, {
        metadata: {
          ...wallet.metadata,
          pendingWithdrawals: [
            ...(wallet.metadata?.pendingWithdrawals || []),
            {
              withdrawalId: savedWithdrawal.id,
              amount: createWithdrawalDto.amount,
            },
          ],
        },
      });

      // Update wallet balances
      wallet.pendingBalance += createWithdrawalDto.amount;
      wallet.availableBalance -= createWithdrawalDto.amount;
      await this.walletService.update(wallet.id, {});

      // Send notification
      await this.notificationService.sendInAppNotification(
        createWithdrawalDto.userId,
        'Withdrawal Request Submitted',
        `Your withdrawal request for $${netAmount} has been submitted and is pending approval.`,
        'withdrawal',
        {
          withdrawalId: savedWithdrawal.id,
          amount: netAmount,
          status: WithdrawalStatus.PENDING,
        },
      );

      return savedWithdrawal;
    } catch (error) {
      this.logger.error(`Failed to create withdrawal: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all withdrawals with filters
   * @param filterDto Filter criteria
   * @returns Withdrawals
   */
  async findAll(filterDto: WithdrawalFilterDto): Promise<{ data: Withdrawal[]; total: number }> {
    try {
      const { userId, status, startDate, endDate, page = 1, limit = 10 } = filterDto;

      const queryBuilder = this.withdrawalRepository.createQueryBuilder('withdrawal');

      // Apply filters
      if (userId) {
        queryBuilder.andWhere('withdrawal.userId = :userId', { userId });
      }

      if (status) {
        queryBuilder.andWhere('withdrawal.status = :status', { status });
      }

      if (startDate && endDate) {
        queryBuilder.andWhere('withdrawal.createdAt BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        });
      } else if (startDate) {
        queryBuilder.andWhere('withdrawal.createdAt >= :startDate', {
          startDate: new Date(startDate),
        });
      } else if (endDate) {
        queryBuilder.andWhere('withdrawal.createdAt <= :endDate', {
          endDate: new Date(endDate),
        });
      }

      // Add pagination
      queryBuilder
        .orderBy('withdrawal.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      // Get results
      const [withdrawals, total] = await queryBuilder.getManyAndCount();

      return { data: withdrawals, total };
    } catch (error) {
      this.logger.error(`Failed to find withdrawals: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find withdrawal by ID
   * @param id Withdrawal ID
   * @returns Withdrawal
   */
  async findOne(id: string): Promise<Withdrawal> {
    try {
      const withdrawal = await this.withdrawalRepository.findOne({
        where: { id },
        relations: ['paymentMethod'],
      });

      if (!withdrawal) {
        throw new NotFoundException(`Withdrawal with ID ${id} not found`);
      }

      return withdrawal;
    } catch (error) {
      this.logger.error(`Failed to find withdrawal: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process withdrawal
   * @param id Withdrawal ID
   * @returns Processed withdrawal
   */
  async processWithdrawal(id: string): Promise<Withdrawal> {
    try {
      const withdrawal = await this.findOne(id);

      // Check if withdrawal is pending
      if (withdrawal.status !== WithdrawalStatus.PENDING) {
        throw new Error(`Withdrawal is already ${withdrawal.status}`);
      }

      // Update withdrawal status
      withdrawal.status = WithdrawalStatus.PROCESSING;
      await this.withdrawalRepository.save(withdrawal);

      // Get user wallet
      const wallet = await this.walletService.findByUserId(withdrawal.userId);

      // Process withdrawal based on payment method type
      let externalReference = '';

      try {
        if (withdrawal.paymentMethod.type === PaymentMethodType.STRIPE) {
          // Process Stripe payout
          const payout = await this.stripeService.createPayout(
            withdrawal.netAmount,
            'usd',
            withdrawal.paymentMethod.externalId,
            {
              withdrawalId: withdrawal.id,
              userId: withdrawal.userId,
            },
          );

          externalReference = payout.id;
        } else {
          throw new Error(`Unsupported payment method type: ${withdrawal.paymentMethod.type}`);
        }

        // Create transaction
        await this.transactionService.create({
          userId: withdrawal.userId,
          type: TransactionType.WITHDRAWAL,
          amount: withdrawal.amount,
          fee: withdrawal.fee,
          sourceWalletId: wallet.id,
          status: TransactionStatus.COMPLETED,
          description: `Withdrawal to ${withdrawal.paymentMethod.name}`,
          externalReference,
        });

        // Update withdrawal
        withdrawal.status = WithdrawalStatus.COMPLETED;
        withdrawal.externalReference = externalReference;
        withdrawal.processedAt = new Date();

        // Update wallet
        wallet.balance -= withdrawal.amount;
        wallet.pendingBalance -= withdrawal.amount;

        // Remove from pending withdrawals
        const pendingWithdrawals = wallet.metadata?.pendingWithdrawals || [];
        wallet.metadata = {
          ...wallet.metadata,
          pendingWithdrawals: pendingWithdrawals.filter(
            (w) => w.withdrawalId !== withdrawal.id,
          ),
        };

        await this.walletService.update(wallet.id, {});

        // Send notification
        await this.notificationService.sendInAppNotification(
          withdrawal.userId,
          'Withdrawal Completed',
          `Your withdrawal of $${withdrawal.netAmount} has been completed.`,
          'withdrawal',
          {
            withdrawalId: withdrawal.id,
            amount: withdrawal.netAmount,
            status: WithdrawalStatus.COMPLETED,
          },
        );
      } catch (error) {
        // Handle failure
        withdrawal.status = WithdrawalStatus.FAILED;
        withdrawal.rejectionReason = error.message;

        // Send notification
        await this.notificationService.sendInAppNotification(
          withdrawal.userId,
          'Withdrawal Failed',
          `Your withdrawal of $${withdrawal.netAmount} has failed: ${error.message}`,
          'withdrawal',
          {
            withdrawalId: withdrawal.id,
            amount: withdrawal.netAmount,
            status: WithdrawalStatus.FAILED,
          },
        );

        // Return funds to available balance
        wallet.availableBalance += withdrawal.amount;
        wallet.pendingBalance -= withdrawal.amount;

        // Remove from pending withdrawals
        const pendingWithdrawals = wallet.metadata?.pendingWithdrawals || [];
        wallet.metadata = {
          ...wallet.metadata,
          pendingWithdrawals: pendingWithdrawals.filter(
            (w) => w.withdrawalId !== withdrawal.id,
          ),
        };

        await this.walletService.update(wallet.id, {});
      }

      // Save withdrawal
      return this.withdrawalRepository.save(withdrawal);
    } catch (error) {
      this.logger.error(`Failed to process withdrawal: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel withdrawal
   * @param id Withdrawal ID
   * @returns Cancelled withdrawal
   */
  async cancelWithdrawal(id: string): Promise<Withdrawal> {
    try {
      const withdrawal = await this.findOne(id);

      // Check if withdrawal is pending
      if (withdrawal.status !== WithdrawalStatus.PENDING) {
        throw new Error(`Withdrawal is already ${withdrawal.status}`);
      }

      // Update withdrawal status
      withdrawal.status = WithdrawalStatus.CANCELLED;

      // Get user wallet
      const wallet = await this.walletService.findByUserId(withdrawal.userId);

      // Return funds to available balance
      wallet.availableBalance += withdrawal.amount;
      wallet.pendingBalance -= withdrawal.amount;

      // Remove from pending withdrawals
      const pendingWithdrawals = wallet.metadata?.pendingWithdrawals || [];
      wallet.metadata = {
        ...wallet.metadata,
        pendingWithdrawals: pendingWithdrawals.filter(
          (w) => w.withdrawalId !== withdrawal.id,
        ),
      };

      await this.walletService.update(wallet.id, {});

      // Save withdrawal
      const savedWithdrawal = await this.withdrawalRepository.save(withdrawal);

      // Send notification
      await this.notificationService.sendInAppNotification(
        withdrawal.userId,
        'Withdrawal Cancelled',
        `Your withdrawal of $${withdrawal.netAmount} has been cancelled.`,
        'withdrawal',
        {
          withdrawalId: withdrawal.id,
          amount: withdrawal.netAmount,
          status: WithdrawalStatus.CANCELLED,
        },
      );

      return savedWithdrawal;
    } catch (error) {
      this.logger.error(`Failed to cancel withdrawal: ${error.message}`);
      throw error;
    }
  }
}
