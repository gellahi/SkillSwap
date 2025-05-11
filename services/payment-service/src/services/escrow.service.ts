import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Escrow, EscrowStatus } from '../entities/escrow.entity';
import { CreateEscrowDto, FundEscrowDto, ReleaseMilestoneDto, UpdateEscrowStatusDto } from '../dto/escrow.dto';
import { TransactionService } from './transaction.service';
import { WalletService } from './wallet.service';
import { ProjectIntegrationService } from './integration/project.service';
import { NotificationIntegrationService } from './integration/notification.service';
import { TransactionStatus, TransactionType } from '../entities/transaction.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);
  private readonly platformFeePercentage: number;

  constructor(
    @InjectRepository(Escrow)
    private escrowRepository: Repository<Escrow>,
    private transactionService: TransactionService,
    private walletService: WalletService,
    private projectService: ProjectIntegrationService,
    private notificationService: NotificationIntegrationService,
    private configService: ConfigService,
  ) {
    this.platformFeePercentage = parseFloat(
      this.configService.get<string>('PLATFORM_FEE_PERCENTAGE', '10'),
    );
  }

  /**
   * Create a new escrow
   * @param createEscrowDto Escrow data
   * @returns Created escrow
   */
  async create(createEscrowDto: CreateEscrowDto): Promise<Escrow> {
    try {
      // Create escrow
      const escrow = this.escrowRepository.create(createEscrowDto);
      
      // Save escrow
      const savedEscrow = await this.escrowRepository.save(escrow);
      
      // Send notification to freelancer
      await this.notificationService.sendInAppNotification(
        createEscrowDto.freelancerId,
        'New Escrow Created',
        'A new escrow has been created for your project.',
        'escrow',
        {
          escrowId: savedEscrow.id,
          projectId: savedEscrow.projectId,
        },
      );
      
      return savedEscrow;
    } catch (error) {
      this.logger.error(`Failed to create escrow: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find escrow by ID
   * @param id Escrow ID
   * @returns Escrow
   */
  async findOne(id: string): Promise<Escrow> {
    try {
      const escrow = await this.escrowRepository.findOne({
        where: { id },
      });
      
      if (!escrow) {
        throw new NotFoundException(`Escrow with ID ${id} not found`);
      }
      
      return escrow;
    } catch (error) {
      this.logger.error(`Failed to find escrow: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find escrows by project ID
   * @param projectId Project ID
   * @returns Escrows
   */
  async findByProjectId(projectId: string): Promise<Escrow[]> {
    try {
      return this.escrowRepository.find({
        where: { projectId },
      });
    } catch (error) {
      this.logger.error(`Failed to find escrows by project ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update escrow status
   * @param id Escrow ID
   * @param updateEscrowStatusDto Update data
   * @returns Updated escrow
   */
  async updateStatus(id: string, updateEscrowStatusDto: UpdateEscrowStatusDto): Promise<Escrow> {
    try {
      const escrow = await this.findOne(id);
      
      // Update escrow
      const updatedEscrow = Object.assign(escrow, updateEscrowStatusDto);
      
      // Save escrow
      const savedEscrow = await this.escrowRepository.save(updatedEscrow);
      
      // Send notifications
      if (updateEscrowStatusDto.status === EscrowStatus.FUNDED) {
        await this.notificationService.sendInAppNotification(
          escrow.freelancerId,
          'Escrow Funded',
          'The escrow for your project has been funded.',
          'escrow',
          {
            escrowId: escrow.id,
            projectId: escrow.projectId,
          },
        );
      } else if (updateEscrowStatusDto.status === EscrowStatus.RELEASED) {
        await this.notificationService.sendInAppNotification(
          escrow.freelancerId,
          'Escrow Released',
          'The escrow for your project has been released.',
          'escrow',
          {
            escrowId: escrow.id,
            projectId: escrow.projectId,
          },
        );
      }
      
      return savedEscrow;
    } catch (error) {
      this.logger.error(`Failed to update escrow status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fund escrow
   * @param id Escrow ID
   * @param fundEscrowDto Fund data
   * @param token JWT token
   * @returns Updated escrow
   */
  async fundEscrow(id: string, fundEscrowDto: FundEscrowDto, token: string): Promise<Escrow> {
    try {
      const escrow = await this.findOne(id);
      
      // Check if escrow is already funded
      if (escrow.status === EscrowStatus.FUNDED) {
        throw new Error('Escrow is already funded');
      }
      
      // Get client wallet
      const clientWallet = await this.walletService.findByUserId(escrow.clientId);
      
      // Check if client has sufficient balance
      if (clientWallet.availableBalance < fundEscrowDto.amount) {
        throw new Error('Insufficient balance');
      }
      
      // Create transaction
      await this.transactionService.create({
        userId: escrow.clientId,
        type: TransactionType.ESCROW_FUNDING,
        amount: fundEscrowDto.amount,
        sourceWalletId: clientWallet.id,
        escrowId: escrow.id,
        projectId: escrow.projectId,
        status: TransactionStatus.COMPLETED,
        description: `Escrow funding for project ${escrow.projectId}`,
      });
      
      // Update escrow
      escrow.fundedAmount += fundEscrowDto.amount;
      
      // Update escrow status if fully funded
      if (escrow.fundedAmount >= escrow.totalAmount) {
        escrow.status = EscrowStatus.FUNDED;
      }
      
      // Save escrow
      const savedEscrow = await this.escrowRepository.save(escrow);
      
      // Send notification to freelancer
      await this.notificationService.sendInAppNotification(
        escrow.freelancerId,
        'Escrow Funded',
        `The escrow for your project has been funded with $${fundEscrowDto.amount}.`,
        'escrow',
        {
          escrowId: escrow.id,
          projectId: escrow.projectId,
        },
      );
      
      return savedEscrow;
    } catch (error) {
      this.logger.error(`Failed to fund escrow: ${error.message}`);
      throw error;
    }
  }

  /**
   * Release milestone payment
   * @param id Escrow ID
   * @param releaseMilestoneDto Release data
   * @param token JWT token
   * @returns Updated escrow
   */
  async releaseMilestonePayment(
    id: string,
    releaseMilestoneDto: ReleaseMilestoneDto,
    token: string,
  ): Promise<Escrow> {
    try {
      const escrow = await this.findOne(id);
      
      // Check if escrow is funded
      if (escrow.status !== EscrowStatus.FUNDED) {
        throw new Error('Escrow is not funded');
      }
      
      // Find milestone
      const milestone = escrow.milestones.find(
        (m) => m.id === releaseMilestoneDto.milestoneId,
      );
      
      if (!milestone) {
        throw new Error('Milestone not found');
      }
      
      // Check if milestone is already released
      if (milestone.status === 'approved') {
        throw new Error('Milestone is already approved');
      }
      
      // Get freelancer wallet
      const freelancerWallet = await this.walletService.findByUserId(escrow.freelancerId);
      
      // Get platform wallet
      const platformWallet = await this.walletService.getPlatformWallet();
      
      // Calculate platform fee
      const platformFee = (milestone.amount * this.platformFeePercentage) / 100;
      
      // Create transaction for freelancer
      await this.transactionService.create({
        userId: escrow.freelancerId,
        type: TransactionType.MILESTONE_PAYMENT,
        amount: milestone.amount,
        fee: platformFee,
        destinationWalletId: freelancerWallet.id,
        escrowId: escrow.id,
        projectId: escrow.projectId,
        milestoneId: milestone.id,
        status: TransactionStatus.COMPLETED,
        description: `Milestone payment for ${milestone.title}`,
      });
      
      // Create transaction for platform fee
      await this.transactionService.create({
        userId: 'platform',
        type: TransactionType.PLATFORM_FEE,
        amount: platformFee,
        destinationWalletId: platformWallet.id,
        escrowId: escrow.id,
        projectId: escrow.projectId,
        milestoneId: milestone.id,
        status: TransactionStatus.COMPLETED,
        description: `Platform fee for milestone ${milestone.title}`,
      });
      
      // Update milestone
      milestone.status = 'approved';
      milestone.releasedAt = new Date();
      
      // Update escrow
      escrow.releasedAmount += milestone.amount;
      
      // Update escrow status if all milestones are released
      const allMilestonesReleased = escrow.milestones.every(
        (m) => m.status === 'approved',
      );
      
      if (allMilestonesReleased) {
        escrow.status = EscrowStatus.RELEASED;
      }
      
      // Save escrow
      const savedEscrow = await this.escrowRepository.save(escrow);
      
      // Update milestone status in bids service
      try {
        await this.projectService.updateMilestoneStatus(
          escrow.projectId,
          milestone.id,
          'approved',
          token,
        );
      } catch (error) {
        this.logger.error(`Failed to update milestone status in bids service: ${error.message}`);
        // Continue even if this fails
      }
      
      // Send notification to freelancer
      await this.notificationService.sendInAppNotification(
        escrow.freelancerId,
        'Milestone Payment Released',
        `Your milestone payment of $${milestone.amount - platformFee} for "${milestone.title}" has been released.`,
        'milestone',
        {
          escrowId: escrow.id,
          projectId: escrow.projectId,
          milestoneId: milestone.id,
        },
      );
      
      return savedEscrow;
    } catch (error) {
      this.logger.error(`Failed to release milestone payment: ${error.message}`);
      throw error;
    }
  }
}
