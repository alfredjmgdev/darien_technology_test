import { BaseSeeder } from './base.seeder';
import { UserEntity } from '../../database/entities/user.entity';
import * as bcrypt from 'bcrypt';

export class UserSeeder extends BaseSeeder {
  async seed(): Promise<void> {
    this.logger.log('Seeding users...');

    const userRepository = this.dataSource.getRepository(UserEntity);

    // Check if users already exist
    const count = await userRepository.count();

    if (count > 0) {
      this.logger.log('Users already seeded');
      return;
    }

    const users = [
      {
        email: 'user1@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Regular User 1',
        createdAt: new Date(),
      },
      {
        email: 'user2@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Regular User 2',
        createdAt: new Date(),
      },
      {
        email: 'user3@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Regular User 3',
        createdAt: new Date(),
      },
    ];

    await userRepository.save(users);
    this.logger.log(`Seeded ${users.length} users`);
  }
}
