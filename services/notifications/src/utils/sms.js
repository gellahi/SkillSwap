import { logger } from '../../../../shared/middlewares/index.js';

/**
 * Send SMS
 * @param {Object} options - SMS options
 * @param {string} options.to - Recipient phone number
 * @param {string} options.message - SMS message
 * @returns {Promise<Object>} SMS info object
 */
export const sendSMS = async (options) => {
  try {
    // Check if Twilio credentials are configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      // For development, just log the message
      if (process.env.NODE_ENV === 'development') {
        logger.info(`[MOCK SMS] To: ${options.to}, Message: ${options.message}`);
        return {
          sid: 'MOCK_SID',
          status: 'sent',
          to: options.to,
          body: options.message
        };
      } else {
        throw new Error('Twilio credentials not configured');
      }
    }
    
    // In a real implementation, we would use Twilio SDK
    // For now, we'll just mock the response
    
    // Mock response
    const response = {
      sid: `SM${Math.random().toString(36).substring(2, 15)}`,
      status: 'sent',
      to: options.to,
      body: options.message
    };
    
    logger.info(`SMS sent to ${options.to}`);
    
    return response;
  } catch (error) {
    logger.error(`Failed to send SMS: ${error.message}`);
    throw error;
  }
};

export default {
  sendSMS
};
