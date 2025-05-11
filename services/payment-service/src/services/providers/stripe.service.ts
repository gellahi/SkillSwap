import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;

  constructor(private configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Create a payment intent
   * @param amount Amount in cents
   * @param currency Currency code
   * @param metadata Additional metadata
   * @returns Payment intent
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, any> = {},
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
      });

      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm a payment intent
   * @param paymentIntentId Payment intent ID
   * @param paymentMethodId Payment method ID
   * @returns Confirmed payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });

      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to confirm payment intent: ${error.message}`);
      throw new Error(`Failed to confirm payment intent: ${error.message}`);
    }
  }

  /**
   * Create a refund
   * @param paymentIntentId Payment intent ID
   * @param amount Amount to refund in cents
   * @param metadata Additional metadata
   * @returns Refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    metadata: Record<string, any> = {},
  ): Promise<Stripe.Refund> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        metadata,
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await this.stripe.refunds.create(refundParams);

      return refund;
    } catch (error) {
      this.logger.error(`Failed to create refund: ${error.message}`);
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  /**
   * Create a payout
   * @param amount Amount in cents
   * @param currency Currency code
   * @param destination Destination account ID
   * @param metadata Additional metadata
   * @returns Payout
   */
  async createPayout(
    amount: number,
    currency: string = 'usd',
    destination: string,
    metadata: Record<string, any> = {},
  ): Promise<Stripe.Payout> {
    try {
      const payout = await this.stripe.payouts.create(
        {
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata,
        },
        {
          stripeAccount: destination,
        },
      );

      return payout;
    } catch (error) {
      this.logger.error(`Failed to create payout: ${error.message}`);
      throw new Error(`Failed to create payout: ${error.message}`);
    }
  }

  /**
   * Create a customer
   * @param email Customer email
   * @param name Customer name
   * @param metadata Additional metadata
   * @returns Customer
   */
  async createCustomer(
    email: string,
    name: string,
    metadata: Record<string, any> = {},
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      });

      return customer;
    } catch (error) {
      this.logger.error(`Failed to create customer: ${error.message}`);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Create a payment method
   * @param customerId Customer ID
   * @param paymentMethodId Payment method ID
   * @returns Payment method
   */
  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      return paymentMethod;
    } catch (error) {
      this.logger.error(`Failed to attach payment method: ${error.message}`);
      throw new Error(`Failed to attach payment method: ${error.message}`);
    }
  }
}
