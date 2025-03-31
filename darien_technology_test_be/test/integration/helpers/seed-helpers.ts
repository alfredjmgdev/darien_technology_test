import { Repository } from 'typeorm';
import { UserEntity } from '../../../src/infrastructure/database/entities/user.entity';
import { SpaceEntity } from '../../../src/infrastructure/database/entities/space.entity';
import * as bcrypt from 'bcrypt';

export async function seedTestUser(
  repository: Repository<UserEntity>,
): Promise<UserEntity> {
  const user = repository.create({
    email: 'test@example.com',
    password: await bcrypt.hash('password123', 10),
    name: 'Test User',
    createdAt: new Date(),
  });

  return repository.save(user);
}

export async function seedTestSpace(
  repository: Repository<SpaceEntity>,
): Promise<SpaceEntity> {
  const space = repository.create({
    name: 'Test Conference Room',
    location: 'Test Building',
    capacity: 10,
    description: 'Test description',
    createdAt: new Date(),
  });

  return repository.save(space);
}
