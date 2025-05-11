import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificationIntegrationService {
  private readonly logger = new Logger(NotificationIntegrationService.name);
  private readonly notificationsServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.notificationsServiceUrl = this.configService.get<string>('NOTIFICATIONS_SERVICE_URL');
  }

  /**
   * Send in-app notification
   * @param userId User ID
   * @param title Notification title
   * @param message Notification message
   * @param type Notification type
   * @param data Additional data
   * @returns Notification data
   */
  async sendInAppNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    data: any = {},
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.notificationsServiceUrl}/api/notify/in-app`,
        {
          userId,
          title,
          message,
          type,
          data,
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send in-app notification: ${error.message}`);
      // Don't throw error, just log it
      return null;
    }
  }

  /**
   * Send email notification
   * @param userId User ID
   * @param email Email address
   * @param subject Email subject
   * @param body Email body
   * @param data Additional data
   * @returns Email notification data
   */
  async sendEmailNotification(
    userId: string,
    email: string,
    subject: string,
    body: string,
    data: any = {},
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.notificationsServiceUrl}/api/notify/email`,
        {
          userId,
          email,
          subject,
          body,
          data,
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${error.message}`);
      // Don't throw error, just log it
      return null;
    }
  }
}
