import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ProjectIntegrationService {
  private readonly logger = new Logger(ProjectIntegrationService.name);
  private readonly projectsServiceUrl: string;
  private readonly bidsServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.projectsServiceUrl = this.configService.get<string>('PROJECTS_SERVICE_URL');
    this.bidsServiceUrl = this.configService.get<string>('BIDS_SERVICE_URL');
  }

  /**
   * Get project by ID
   * @param projectId Project ID
   * @param token JWT token
   * @returns Project data
   */
  async getProjectById(projectId: string, token: string): Promise<any> {
    try {
      const response = await axios.get(`${this.projectsServiceUrl}/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get project: ${error.message}`);
      throw new Error('Failed to get project');
    }
  }

  /**
   * Get bid by ID
   * @param bidId Bid ID
   * @param token JWT token
   * @returns Bid data
   */
  async getBidById(bidId: string, token: string): Promise<any> {
    try {
      const response = await axios.get(`${this.bidsServiceUrl}/api/bids/${bidId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get bid: ${error.message}`);
      throw new Error('Failed to get bid');
    }
  }

  /**
   * Get milestone by ID
   * @param bidId Bid ID
   * @param milestoneId Milestone ID
   * @param token JWT token
   * @returns Milestone data
   */
  async getMilestoneById(bidId: string, milestoneId: string, token: string): Promise<any> {
    try {
      const bid = await this.getBidById(bidId, token);
      const milestone = bid.milestones.find((m) => m.id === milestoneId);

      if (!milestone) {
        throw new Error('Milestone not found');
      }

      return milestone;
    } catch (error) {
      this.logger.error(`Failed to get milestone: ${error.message}`);
      throw new Error('Failed to get milestone');
    }
  }

  /**
   * Update milestone status
   * @param bidId Bid ID
   * @param milestoneId Milestone ID
   * @param status New status
   * @param token JWT token
   * @returns Updated milestone
   */
  async updateMilestoneStatus(
    bidId: string,
    milestoneId: string,
    status: string,
    token: string,
  ): Promise<any> {
    try {
      const response = await axios.patch(
        `${this.bidsServiceUrl}/api/bids/${bidId}/milestones/${milestoneId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to update milestone status: ${error.message}`);
      throw new Error('Failed to update milestone status');
    }
  }
}
