import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletStatus, WalletType } from '../entities/wallet.entity';
import { CreateWalletDto, UpdateWalletDto } from '../dto/wallet.dto';
import { AuthIntegrationService } from './integration/auth.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private authService: AuthIntegrationService,
  ) {}

  /**
   * Create a new wallet
   * @param createWalletDto Wallet data
   * @returns Created wallet
   */
  async create(createWalletDto: CreateWalletDto): Promise<Wallet> {
    try {
      // Check if wallet already exists for this user
      const existingWallet = await this.walletRepository.findOne({
        where: { userId: createWalletDto.userId },
      });
      
      if (existingWallet) {
        return existingWallet;
      }
      
      // Create new wallet
      const wallet = this.walletRepository.create({
        ...createWalletDto,
        balance: 0,
        availableBalance: 0,
        pendingBalance: 0,
        status: WalletStatus.ACTIVE,
        currency: createWalletDto.currency || 'USD',
      });
      
      return this.walletRepository.save(wallet);
    } catch (error) {
      this.logger.error(`Failed to create wallet: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find wallet by user ID
   * @param userId User ID
   * @returns Wallet
   */
  async findByUserId(userId: string): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findOne({
        where: { userId },
      });
      
      if (!wallet) {
        // Create wallet if it doesn't exist
        return this.create({ userId });
      }
      
      return wallet;
    } catch (error) {
      this.logger.error(`Failed to find wallet: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find wallet by ID
   * @param id Wallet ID
   * @returns Wallet
   */
  async findOne(id: string): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findOne({
        where: { id },
      });
      
      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${id} not found`);
      }
      
      return wallet;
    } catch (error) {
      this.logger.error(`Failed to find wallet: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update wallet
   * @param id Wallet ID
   * @param updateWalletDto Update data
   * @returns Updated wallet
   */
  async update(id: string, updateWalletDto: UpdateWalletDto): Promise<Wallet> {
    try {
      const wallet = await this.findOne(id);
      
      // Update wallet
      const updatedWallet = Object.assign(wallet, updateWalletDto);
      
      return this.walletRepository.save(updatedWallet);
    } catch (error) {
      this.logger.error(`Failed to update wallet: ${error.message}`);
      throw error;
    }
  }

  /**
   * Increment wallet balance
   * @param id Wallet ID
   * @param amount Amount to increment
   * @returns Updated wallet
   */
  async incrementBalance(id: string, amount: number): Promise<Wallet> {
    try {
      const wallet = await this.findOne(id);
      
      // Update balance
      wallet.balance += amount;
      wallet.availableBalance += amount;
      
      return this.walletRepository.save(wallet);
    } catch (error) {
      this.logger.error(`Failed to increment wallet balance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Decrement wallet balance
   * @param id Wallet ID
   * @param amount Amount to decrement
   * @returns Updated wallet
   */
  async decrementBalance(id: string, amount: number): Promise<Wallet> {
    try {
      const wallet = await this.findOne(id);
      
      // Check if wallet has sufficient balance
      if (wallet.availableBalance < amount) {
        throw new Error('Insufficient balance');
      }
      
      // Update balance
      wallet.balance -= amount;
      wallet.availableBalance -= amount;
      
      return this.walletRepository.save(wallet);
    } catch (error) {
      this.logger.error(`Failed to decrement wallet balance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get platform wallet
   * @returns Platform wallet
   */
  async getPlatformWallet(): Promise<Wallet> {
    try {
      const platformWallet = await this.walletRepository.findOne({
        where: { type: WalletType.PLATFORM },
      });
      
      if (!platformWallet) {
        // Create platform wallet if it doesn't exist
        return this.walletRepository.save({
          userId: 'platform',
          type: WalletType.PLATFORM,
          balance: 0,
          availableBalance: 0,
          pendingBalance: 0,
          status: WalletStatus.ACTIVE,
          currency: 'USD',
        });
      }
      
      return platformWallet;
    } catch (error) {
      this.logger.error(`Failed to get platform wallet: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user balance
   * @param userId User ID
   * @returns User balance
   */
  async getUserBalance(userId: string): Promise<{
    balance: number;
    availableBalance: number;
    pendingBalance: number;
    currency: string;
  }> {
    try {
      const wallet = await this.findByUserId(userId);
      
      return {
        balance: wallet.balance,
        availableBalance: wallet.availableBalance,
        pendingBalance: wallet.pendingBalance,
        currency: wallet.currency,
      };
    } catch (error) {
      this.logger.error(`Failed to get user balance: ${error.message}`);
      throw error;
    }
  }
}
