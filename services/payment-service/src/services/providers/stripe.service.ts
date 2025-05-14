import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly accountCountry: string;

  constructor(private configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    // Make webhook secret optional
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
    this.accountCountry = this.configService.get<string>('STRIPE_ACCOUNT_COUNTRY', 'US');

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    if (!stripeSecretKey) {
      this.logger.warn('Stripe secret key not provided. Stripe integration will not work properly.');
    }
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

  /**
   * Create a setup intent for adding a payment method
   * @param customerId Customer ID
   * @param metadata Additional metadata
   * @returns Setup intent
   */
  async createSetupIntent(
    customerId: string,
    metadata: Record<string, any> = {},
  ): Promise<Stripe.SetupIntent> {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        metadata,
      });

      return setupIntent;
    } catch (error) {
      this.logger.error(`Failed to create setup intent: ${error.message}`);
      throw new Error(`Failed to create setup intent: ${error.message}`);
    }
  }

  /**
   * Get payment method details
   * @param paymentMethodId Payment method ID
   * @returns Payment method
   */
  async getPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.retrieve(paymentMethodId);
    } catch (error) {
      this.logger.error(`Failed to get payment method: ${error.message}`);
      throw new Error(`Failed to get payment method: ${error.message}`);
    }
  }

  /**
   * List customer payment methods
   * @param customerId Customer ID
   * @param type Payment method type
   * @returns Payment methods
   */
  async listPaymentMethods(
    customerId: string,
    type: 'card' | 'bank_account' = 'card',
  ): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
    try {
      return await this.stripe.customers.listPaymentMethods(customerId, { type });
    } catch (error) {
      this.logger.error(`Failed to list payment methods: ${error.message}`);
      throw new Error(`Failed to list payment methods: ${error.message}`);
    }
  }

  /**
   * Detach payment method
   * @param paymentMethodId Payment method ID
   * @returns Payment method
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      this.logger.error(`Failed to detach payment method: ${error.message}`);
      throw new Error(`Failed to detach payment method: ${error.message}`);
    }
  }

  /**
   * Create a connected account for a freelancer
   * @param email Freelancer email
   * @param country Country code
   * @param metadata Additional metadata
   * @returns Connected account
   */
  async createConnectedAccount(
    email: string,
    country: string = this.accountCountry,
    metadata: Record<string, any> = {},
  ): Promise<Stripe.Account> {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country,
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata,
      });

      return account;
    } catch (error) {
      this.logger.error(`Failed to create connected account: ${error.message}`);
      throw new Error(`Failed to create connected account: ${error.message}`);
    }
  }

  /**
   * Create an account link for onboarding
   * @param accountId Connected account ID
   * @param refreshUrl URL to redirect on refresh
   * @param returnUrl URL to redirect on completion
   * @returns Account link
   */
  async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<Stripe.AccountLink> {
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink;
    } catch (error) {
      this.logger.error(`Failed to create account link: ${error.message}`);
      throw new Error(`Failed to create account link: ${error.message}`);
    }
  }

  /**
   * Get connected account details
   * @param accountId Connected account ID
   * @returns Connected account
   */
  async getConnectedAccount(accountId: string): Promise<Stripe.Account> {
    try {
      return await this.stripe.accounts.retrieve(accountId);
    } catch (error) {
      this.logger.error(`Failed to get connected account: ${error.message}`);
      throw new Error(`Failed to get connected account: ${error.message}`);
    }
  }

  /**
   * Create a transfer to a connected account
   * @param amount Amount to transfer
   * @param currency Currency code
   * @param destinationAccountId Destination account ID
   * @param metadata Additional metadata
   * @returns Transfer
   */
  async createTransfer(
    amount: number,
    currency: string = 'usd',
    destinationAccountId: string,
    metadata: Record<string, any> = {},
  ): Promise<Stripe.Transfer> {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        destination: destinationAccountId,
        metadata,
      });

      return transfer;
    } catch (error) {
      this.logger.error(`Failed to create transfer: ${error.message}`);
      throw new Error(`Failed to create transfer: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   * @param payload Request body
   * @param signature Stripe signature
   * @returns Event
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    try {
      // If webhook secret is not provided, log a warning and parse the payload directly
      if (!this.webhookSecret) {
        this.logger.warn('Webhook secret not provided. Skipping signature verification.');
        // Parse the payload as JSON and return it as an event
        // Note: This is not secure for production, but allows development without webhooks
        return JSON.parse(payload) as Stripe.Event;
      }

      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }
}
