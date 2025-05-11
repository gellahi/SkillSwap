import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod, PaymentMethodStatus, PaymentMethodType } from '../entities/payment-method.entity';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from '../dto/payment-method.dto';
import { StripeService } from './providers/stripe.service';

@Injectable()
export class PaymentMethodService {
  private readonly logger = new Logger(PaymentMethodService.name);

  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    private stripeService: StripeService,
  ) {}

  /**
   * Create a new payment method
   * @param createPaymentMethodDto Payment method data
   * @returns Created payment method
   */
  async create(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    try {
      // Create payment method
      const paymentMethod = this.paymentMethodRepository.create(createPaymentMethodDto);
      
      // If this is the first payment method for the user, set it as default
      const existingMethods = await this.findByUserId(createPaymentMethodDto.userId);
      
      if (existingMethods.length === 0) {
        paymentMethod.isDefault = true;
      }
      
      // Save payment method
      return this.paymentMethodRepository.save(paymentMethod);
    } catch (error) {
      this.logger.error(`Failed to create payment method: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find payment methods by user ID
   * @param userId User ID
   * @returns Payment methods
   */
  async findByUserId(userId: string): Promise<PaymentMethod[]> {
    try {
      return this.paymentMethodRepository.find({
        where: { userId },
        order: { isDefault: 'DESC', createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to find payment methods: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find payment method by ID
   * @param id Payment method ID
   * @returns Payment method
   */
  async findOne(id: string): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.paymentMethodRepository.findOne({
        where: { id },
      });
      
      if (!paymentMethod) {
        throw new NotFoundException(`Payment method with ID ${id} not found`);
      }
      
      return paymentMethod;
    } catch (error) {
      this.logger.error(`Failed to find payment method: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update payment method
   * @param id Payment method ID
   * @param updatePaymentMethodDto Update data
   * @returns Updated payment method
   */
  async update(id: string, updatePaymentMethodDto: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.findOne(id);
      
      // Update payment method
      const updatedPaymentMethod = Object.assign(paymentMethod, updatePaymentMethodDto);
      
      // If setting as default, unset other payment methods as default
      if (updatePaymentMethodDto.isDefault) {
        await this.paymentMethodRepository.update(
          { userId: paymentMethod.userId, id: { $ne: id } },
          { isDefault: false },
        );
      }
      
      return this.paymentMethodRepository.save(updatedPaymentMethod);
    } catch (error) {
      this.logger.error(`Failed to update payment method: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete payment method
   * @param id Payment method ID
   * @returns Deleted payment method
   */
  async remove(id: string): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.findOne(id);
      
      // Delete payment method
      await this.paymentMethodRepository.remove(paymentMethod);
      
      // If this was the default payment method, set another one as default
      if (paymentMethod.isDefault) {
        const otherMethods = await this.findByUserId(paymentMethod.userId);
        
        if (otherMethods.length > 0) {
          otherMethods[0].isDefault = true;
          await this.paymentMethodRepository.save(otherMethods[0]);
        }
      }
      
      return paymentMethod;
    } catch (error) {
      this.logger.error(`Failed to delete payment method: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get default payment method for user
   * @param userId User ID
   * @returns Default payment method
   */
  async getDefaultPaymentMethod(userId: string): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.paymentMethodRepository.findOne({
        where: { userId, isDefault: true },
      });
      
      if (!paymentMethod) {
        // Try to get any payment method
        const methods = await this.findByUserId(userId);
        
        if (methods.length > 0) {
          return methods[0];
        }
        
        throw new NotFoundException(`No payment methods found for user ${userId}`);
      }
      
      return paymentMethod;
    } catch (error) {
      this.logger.error(`Failed to get default payment method: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify payment method with Stripe
   * @param id Payment method ID
   * @param stripePaymentMethodId Stripe payment method ID
   * @returns Verified payment method
   */
  async verifyStripePaymentMethod(id: string, stripePaymentMethodId: string): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.findOne(id);
      
      // Update payment method
      paymentMethod.externalId = stripePaymentMethodId;
      paymentMethod.status = PaymentMethodStatus.ACTIVE;
      
      return this.paymentMethodRepository.save(paymentMethod);
    } catch (error) {
      this.logger.error(`Failed to verify Stripe payment method: ${error.message}`);
      throw error;
    }
  }
}
