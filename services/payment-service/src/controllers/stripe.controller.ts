import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { StripeService } from '../services/providers/stripe.service';
import { AuthGuard } from '../guards/auth.guard';
import { TransactionLoggingInterceptor } from '../interceptors/transaction-logging.interceptor';
import { PaymentMethodService } from '../services/payment-method.service';
import { PaymentMethodType } from '../entities/payment-method.entity';

@Controller('stripe')
@UseGuards(AuthGuard)
@UseInterceptors(TransactionLoggingInterceptor)
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentMethodService: PaymentMethodService,
  ) {}

  @Post('setup-intent')
  async createSetupIntent(@Request() req) {
    // Get or create Stripe customer
    let customerId = req.user.stripeCustomerId;

    if (!customerId) {
      // Create a new customer
      const customer = await this.stripeService.createCustomer(
        req.user.email,
        `${req.user.firstName} ${req.user.lastName}`,
        { userId: req.user.id },
      );
      customerId = customer.id;

      // TODO: Update user with Stripe customer ID
    }

    // Create setup intent
    const setupIntent = await this.stripeService.createSetupIntent(customerId, {
      userId: req.user.id,
    });

    return {
      clientSecret: setupIntent.client_secret,
    };
  }

  @Post('payment-methods')
  async addPaymentMethod(@Body() body: { paymentMethodId: string }, @Request() req) {
    // Get or create Stripe customer
    let customerId = req.user.stripeCustomerId;

    if (!customerId) {
      // Create a new customer
      const customer = await this.stripeService.createCustomer(
        req.user.email,
        `${req.user.firstName} ${req.user.lastName}`,
        { userId: req.user.id },
      );
      customerId = customer.id;

      // TODO: Update user with Stripe customer ID
    }

    // Attach payment method to customer
    const paymentMethod = await this.stripeService.attachPaymentMethod(
      customerId,
      body.paymentMethodId,
    );

    // Get payment method details
    const paymentMethodDetails = await this.stripeService.getPaymentMethod(
      body.paymentMethodId,
    );

    // Create payment method in database
    const newPaymentMethod = await this.paymentMethodService.create({
      userId: req.user.id,
      type: PaymentMethodType.STRIPE,
      name: `${paymentMethodDetails.card.brand} ending in ${paymentMethodDetails.card.last4}`,
      externalId: body.paymentMethodId,
      details: {
        brand: paymentMethodDetails.card.brand,
        last4: paymentMethodDetails.card.last4,
        expMonth: paymentMethodDetails.card.exp_month,
        expYear: paymentMethodDetails.card.exp_year,
      },
    });

    return newPaymentMethod;
  }

  @Get('payment-methods')
  async getPaymentMethods(@Request() req) {
    // If user has a Stripe customer ID, get payment methods from Stripe
    if (req.user.stripeCustomerId) {
      const paymentMethods = await this.stripeService.listPaymentMethods(
        req.user.stripeCustomerId,
      );

      return paymentMethods.data;
    }

    // Otherwise, return empty array
    return [];
  }

  @Post('connected-account')
  async createConnectedAccount(@Request() req) {
    // Create a connected account for the freelancer
    const account = await this.stripeService.createConnectedAccount(
      req.user.email,
      undefined, // Use default country
      { userId: req.user.id },
    );

    // Create account link for onboarding
    const accountLink = await this.stripeService.createAccountLink(
      account.id,
      `${process.env.FRONTEND_URL}/dashboard/payments/refresh`,
      `${process.env.FRONTEND_URL}/dashboard/payments/complete`,
    );

    // TODO: Update user with Stripe connected account ID

    return {
      accountId: account.id,
      accountLinkUrl: accountLink.url,
    };
  }

  @Get('connected-account/:id')
  async getConnectedAccount(@Param('id') id: string, @Request() req) {
    // Only allow admin or account owner to access
    if (req.user.role !== 'admin' && req.user.stripeConnectedAccountId !== id) {
      throw new Error('Unauthorized');
    }

    const account = await this.stripeService.getConnectedAccount(id);
    return account;
  }

  @Post('payment-intent')
  async createPaymentIntent(
    @Body() body: { amount: number; currency?: string; metadata?: Record<string, any> },
    @Request() req,
  ) {
    const { amount, currency = 'usd', metadata = {} } = body;

    // Create payment intent
    const paymentIntent = await this.stripeService.createPaymentIntent(
      amount,
      currency,
      {
        userId: req.user.id,
        ...metadata,
      },
    );

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }
}
