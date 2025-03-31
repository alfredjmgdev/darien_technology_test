import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

export abstract class BaseSeeder {
  protected logger = new Logger(this.constructor.name);

  constructor(protected dataSource: DataSource) {}

  abstract seed(): Promise<void>;
}
