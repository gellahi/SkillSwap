import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl: string;
  private accessToken: string;
  private tokenExpiry: Date;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    
    const environment = this.configService.get<string>('PAYPAL_ENVIRONMENT', 'sandbox');
    this.baseUrl = environment === 'production'
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com';
  }

  /**
   * Get access token
   * @returns Access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
          },
        },
      );

      this.accessToken = response.data.access_token;
      // Set token expiry (subtract 60 seconds to be safe)
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 60) * 1000);

      return this.accessToken;
    } catch (error) {
      this.logger.error(`Failed to get PayPal access token: ${error.message}`);
      throw new Error(`Failed to get PayPal access token: ${error.message}`);
    }
  }

  /**
   * Create a payment
   * @param amount Amount
   * @param currency Currency code
   * @param description Payment description
   * @param returnUrl Return URL after payment
   * @param cancelUrl Cancel URL
   * @returns Payment data
   */
  async createPayment(
    amount: number,
    currency: string = 'USD',
    description: string,
    returnUrl: string,
    cancelUrl: string,
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount.toFixed(2),
              },
              description,
            },
          ],
          application_context: {
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create PayPal payment: ${error.message}`);
      throw new Error(`Failed to create PayPal payment: ${error.message}`);
    }
  }

  /**
   * Capture a payment
   * @param orderId Order ID
   * @returns Captured payment data
   */
  async capturePayment(orderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to capture PayPal payment: ${error.message}`);
      throw new Error(`Failed to capture PayPal payment: ${error.message}`);
    }
  }

  /**
   * Create a payout
   * @param email Recipient email
   * @param amount Amount
   * @param currency Currency code
   * @param note Note to recipient
   * @returns Payout data
   */
  async createPayout(
    email: string,
    amount: number,
    currency: string = 'USD',
    note: string,
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/v1/payments/payouts`,
        {
          sender_batch_header: {
            sender_batch_id: `batch_${Date.now()}`,
            email_subject: 'You have a payout from SkillSwap',
            email_message: note,
          },
          items: [
            {
              recipient_type: 'EMAIL',
              amount: {
                value: amount.toFixed(2),
                currency,
              },
              note,
              receiver: email,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create PayPal payout: ${error.message}`);
      throw new Error(`Failed to create PayPal payout: ${error.message}`);
    }
  }

  /**
   * Refund a payment
   * @param captureId Capture ID
   * @param amount Amount to refund
   * @param currency Currency code
   * @param note Note for refund
   * @returns Refund data
   */
  async refundPayment(
    captureId: string,
    amount: number,
    currency: string = 'USD',
    note: string,
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/v2/payments/captures/${captureId}/refund`,
        {
          amount: {
            value: amount.toFixed(2),
            currency_code: currency,
          },
          note_to_payer: note,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to refund PayPal payment: ${error.message}`);
      throw new Error(`Failed to refund PayPal payment: ${error.message}`);
    }
  }
}
