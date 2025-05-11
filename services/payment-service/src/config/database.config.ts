import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Get TypeORM configuration
 * @param configService Config service
 * @returns TypeORM configuration
 */
export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    url: configService.get<string>('DATABASE_URL'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
    ssl: configService.get<string>('NODE_ENV') === 'production',
    logging: configService.get<string>('NODE_ENV') === 'development',
  };
};
