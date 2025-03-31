import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTestDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'sqlite',
  database: ':memory:',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
});
