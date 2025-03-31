import { Logger } from '@nestjs/common';
import { UserSeeder } from './user.seeder';
import { SpaceSeeder } from './space.seeder';
import { ReservationSeeder } from './reservation.seeder';
import { getDatabaseConfig } from '../database.config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

const logger = new Logger('Seeder');

// Create a manual config service for seeding
const configService = new ConfigService();
// Create a new data source using the config
const dbConfig = getDatabaseConfig(configService);
const dataSource = new DataSource({
  type: dbConfig.type,
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: dbConfig.entities,
  synchronize: dbConfig.synchronize,
} as DataSourceOptions);

async function runSeeders() {
  logger.log('Starting database seeding...');

  try {
    // Initialize the data source
    await dataSource.initialize();
    logger.log('Data source initialized');

    // Run seeders in order (users first, then spaces, then reservations)
    const userSeeder = new UserSeeder(dataSource);
    await userSeeder.seed();

    const spaceSeeder = new SpaceSeeder(dataSource);
    await spaceSeeder.seed();

    const reservationSeeder = new ReservationSeeder(dataSource);
    await reservationSeeder.seed();

    logger.log('Database seeding completed successfully');
  } catch (error) {
    logger.error(
      `Error during database seeding: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  } finally {
    // Close the connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      logger.log('Data source connection closed');
    }
  }
}

// Run the seeders
runSeeders()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error(`Seeding failed: ${error}`);
    process.exit(1);
  });
