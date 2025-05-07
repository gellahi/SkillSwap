import nodemailer from 'nodemailer';
import { logger } from '../../../../shared/middlewares/index.js';

// Create reusable transporter
let transporter;

/**
 * Initialize email transporter
 */
export const initEmailTransporter = () => {
  try {
    // Create transporter
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    // Verify connection
    transporter.verify((error) => {
      if (error) {
        logger.error(`Email transporter error: ${error.message}`);
      } else {
        logger.info('Email transporter ready');
      }
    });
  } catch (error) {
    logger.error(`Failed to initialize email transporter: ${error.message}`);
  }
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version of email
 * @param {string} options.html - HTML version of email
 * @param {Object} options.data - Additional data for templates
 * @returns {Promise<Object>} Nodemailer info object
 */
export const sendEmail = async (options) => {
  try {
    // Check if transporter is initialized
    if (!transporter) {
      // For development, create a test account
      if (process.env.NODE_ENV === 'development') {
        const testAccount = await nodemailer.createTestAccount();
        
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        
        logger.info('Using Ethereal test account for email');
      } else {
        initEmailTransporter();
      }
    }
    
    // Set up email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"SkillSwap" <noreply@skillswap.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || `<p>${options.text}</p>`
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    // Log email URL for development
    if (process.env.NODE_ENV === 'development') {
      logger.info(`Email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return info;
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`);
    throw error;
  }
};

export default {
  initEmailTransporter,
  sendEmail
};
