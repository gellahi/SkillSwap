import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * Initialize the database with required tables and initial data
 */
async function bootstrap() {
  const logger = new Logger('InitDB');
  logger.log('Initializing database...');

  const app = await NestFactory.create(AppModule);
  const dataSource = app.get<DataSource>(getDataSourceToken());

  try {
    // Check if database is connected
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    logger.log('Database connected successfully');

    // Create platform wallet if it doesn't exist
    const walletRepository = dataSource.getRepository('wallets');
    const platformWallet = await walletRepository.findOne({
      where: { userId: 'platform', type: 'platform' },
    });

    if (!platformWallet) {
      logger.log('Creating platform wallet...');
      await walletRepository.save({
        userId: 'platform',
        type: 'platform',
        balance: 0,
        availableBalance: 0,
        pendingBalance: 0,
        status: 'active',
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      logger.log('Platform wallet created successfully');
    } else {
      logger.log('Platform wallet already exists');
    }

    logger.log('Database initialization completed successfully');
  } catch (error) {
    logger.error(`Database initialization failed: ${error.message}`);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the script
bootstrap()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Initialization failed:', error);
    process.exit(1);
  });
