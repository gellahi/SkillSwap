import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthIntegrationService {
  private readonly logger = new Logger(AuthIntegrationService.name);
  private readonly authServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');
  }

  /**
   * Verify user by ID
   * @param userId User ID
   * @param token JWT token
   * @returns User data
   */
  async verifyUser(userId: string, token: string): Promise<any> {
    try {
      const response = await axios.get(`${this.authServiceUrl}/api/auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to verify user: ${error.message}`);
      throw new Error('Failed to verify user');
    }
  }

  /**
   * Get user by ID
   * @param userId User ID
   * @param token JWT token
   * @returns User data
   */
  async getUserById(userId: string, token: string): Promise<any> {
    try {
      const response = await axios.get(`${this.authServiceUrl}/api/auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get user: ${error.message}`);
      throw new Error('Failed to get user');
    }
  }
}
