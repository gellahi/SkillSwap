import {
  Controller,
  Post,
  RawBodyRequest,
  Req,
  Headers,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from '../services/providers/stripe.service';
import { TransactionService } from '../services/transaction.service';
import { WalletService } from '../services/wallet.service';
import { PaymentMethodService } from '../services/payment-method.service';
import { WithdrawalService } from '../services/withdrawal.service';
import { TransactionStatus, TransactionType } from '../entities/transaction.entity';
import { PaymentMethodStatus } from '../entities/payment-method.entity';
import { WithdrawalStatus } from '../entities/withdrawal.entity';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly transactionService: TransactionService,
    private readonly walletService: WalletService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly withdrawalService: WithdrawalService,
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      // Make signature optional for development without webhooks
      const payload = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

      // If signature is missing but we're in development mode, proceed anyway
      if (!signature) {
        this.logger.warn('Missing stripe-signature header. This is insecure for production.');
        // Only allow this in development mode
        if (process.env.NODE_ENV === 'production') {
          throw new HttpException('Missing stripe-signature header', HttpStatus.BAD_REQUEST);
        }
      }

      const event = this.stripeService.verifyWebhookSignature(payload, signature || '');
      this.logger.log(`Processing Stripe webhook event: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;

        case 'payment_method.attached':
          await this.handlePaymentMethodAttached(event.data.object);
          break;

        case 'payment_method.detached':
          await this.handlePaymentMethodDetached(event.data.object);
          break;

        case 'payout.created':
          await this.handlePayoutCreated(event.data.object);
          break;

        case 'payout.paid':
          await this.handlePayoutPaid(event.data.object);
          break;

        case 'payout.failed':
          await this.handlePayoutFailed(event.data.object);
          break;

        case 'account.updated':
          await this.handleAccountUpdated(event.data.object);
          break;

        default:
          this.logger.log(`Unhandled Stripe webhook event: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Error handling Stripe webhook: ${error.message}`);
      throw new HttpException(
        `Webhook error: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    try {
      // Find transaction by external reference
      const transactions = await this.transactionService.findAll({
        externalReference: paymentIntent.id,
      });

      if (transactions.data.length === 0) {
        this.logger.warn(`No transaction found for payment intent: ${paymentIntent.id}`);
        return;
      }

      const transaction = transactions.data[0];

      // Update transaction status
      await this.transactionService.updateStatus(transaction.id, {
        status: TransactionStatus.COMPLETED,
      });

      this.logger.log(`Transaction ${transaction.id} marked as completed`);
    } catch (error) {
      this.logger.error(`Error handling payment_intent.succeeded: ${error.message}`);
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: any) {
    try {
      // Find transaction by external reference
      const transactions = await this.transactionService.findAll({
        externalReference: paymentIntent.id,
      });

      if (transactions.data.length === 0) {
        this.logger.warn(`No transaction found for payment intent: ${paymentIntent.id}`);
        return;
      }

      const transaction = transactions.data[0];

      // Update transaction status
      await this.transactionService.updateStatus(transaction.id, {
        status: TransactionStatus.FAILED,
        metadata: {
          ...transaction.metadata,
          failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
        },
      });

      this.logger.log(`Transaction ${transaction.id} marked as failed`);
    } catch (error) {
      this.logger.error(`Error handling payment_intent.payment_failed: ${error.message}`);
    }
  }

  private async handlePaymentMethodAttached(paymentMethod: any) {
    try {
      // Find payment method by external ID
      const paymentMethods = await this.paymentMethodService.findByExternalId(paymentMethod.id);

      if (paymentMethods.length === 0) {
        this.logger.warn(`No payment method found for external ID: ${paymentMethod.id}`);
        return;
      }

      const paymentMethodEntity = paymentMethods[0];

      // Update payment method status
      await this.paymentMethodService.update(paymentMethodEntity.id, {
        status: PaymentMethodStatus.ACTIVE,
        details: {
          ...paymentMethodEntity.details,
          brand: paymentMethod.card?.brand,
          last4: paymentMethod.card?.last4,
          expMonth: paymentMethod.card?.exp_month,
          expYear: paymentMethod.card?.exp_year,
        },
      });

      this.logger.log(`Payment method ${paymentMethodEntity.id} activated`);
    } catch (error) {
      this.logger.error(`Error handling payment_method.attached: ${error.message}`);
    }
  }

  private async handlePaymentMethodDetached(paymentMethod: any) {
    try {
      // Find payment method by external ID
      const paymentMethods = await this.paymentMethodService.findByExternalId(paymentMethod.id);

      if (paymentMethods.length === 0) {
        this.logger.warn(`No payment method found for external ID: ${paymentMethod.id}`);
        return;
      }

      const paymentMethodEntity = paymentMethods[0];

      // Update payment method status
      await this.paymentMethodService.update(paymentMethodEntity.id, {
        status: PaymentMethodStatus.INACTIVE,
      });

      this.logger.log(`Payment method ${paymentMethodEntity.id} deactivated`);
    } catch (error) {
      this.logger.error(`Error handling payment_method.detached: ${error.message}`);
    }
  }

  private async handlePayoutCreated(payout: any) {
    this.logger.log(`Payout created: ${payout.id}`);
    // Additional logic can be added here if needed
  }

  private async handlePayoutPaid(payout: any) {
    try {
      // Find withdrawal by external reference
      if (!payout.metadata?.withdrawalId) {
        this.logger.warn(`No withdrawal ID in payout metadata: ${payout.id}`);
        return;
      }

      const withdrawalId = payout.metadata.withdrawalId;
      const withdrawal = await this.withdrawalService.findOne(withdrawalId);

      // Update withdrawal status if it's still processing
      if (withdrawal.status === WithdrawalStatus.PROCESSING) {
        await this.withdrawalService.updateStatus(withdrawalId, {
          status: WithdrawalStatus.COMPLETED,
          processedAt: new Date(),
        });

        this.logger.log(`Withdrawal ${withdrawalId} marked as completed`);
      }
    } catch (error) {
      this.logger.error(`Error handling payout.paid: ${error.message}`);
    }
  }

  private async handlePayoutFailed(payout: any) {
    try {
      // Find withdrawal by external reference
      if (!payout.metadata?.withdrawalId) {
        this.logger.warn(`No withdrawal ID in payout metadata: ${payout.id}`);
        return;
      }

      const withdrawalId = payout.metadata.withdrawalId;
      const withdrawal = await this.withdrawalService.findOne(withdrawalId);

      // Update withdrawal status if it's still processing
      if (withdrawal.status === WithdrawalStatus.PROCESSING) {
        await this.withdrawalService.updateStatus(withdrawalId, {
          status: WithdrawalStatus.FAILED,
          rejectionReason: payout.failure_message || 'Payout failed',
        });

        this.logger.log(`Withdrawal ${withdrawalId} marked as failed`);
      }
    } catch (error) {
      this.logger.error(`Error handling payout.failed: ${error.message}`);
    }
  }

  private async handleAccountUpdated(account: any) {
    this.logger.log(`Stripe connected account updated: ${account.id}`);
    // Additional logic for handling connected account updates
  }
}
