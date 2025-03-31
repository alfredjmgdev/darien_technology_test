import { BaseSeeder } from './base.seeder';
import { SpaceEntity } from '../../database/entities/space.entity';

export class SpaceSeeder extends BaseSeeder {
  async seed(): Promise<void> {
    this.logger.log('Seeding spaces...');

    const spaceRepository = this.dataSource.getRepository(SpaceEntity);

    // Check if spaces already exist
    const count = await spaceRepository.count();
    if (count > 0) {
      this.logger.log('Spaces already seeded');
      return;
    }

    const spaces = [
      {
        name: 'Conference Room A',
        location: 'Building 1, Floor 2',
        capacity: 20,
        description: 'Large conference room with projector and whiteboard',
        createdAt: new Date(),
      },
      {
        name: 'Meeting Room B',
        location: 'Building 1, Floor 3',
        capacity: 8,
        description: 'Small meeting room with video conferencing equipment',
        createdAt: new Date(),
      },
      {
        name: 'Auditorium',
        location: 'Building 2, Ground Floor',
        capacity: 100,
        description: 'Large auditorium for presentations and events',
        createdAt: new Date(),
      },
      {
        name: 'Collaboration Space',
        location: 'Building 3, Floor 1',
        capacity: 15,
        description: 'Open space with flexible seating for team collaboration',
        createdAt: new Date(),
      },
      {
        name: 'Executive Boardroom',
        location: 'Building 1, Floor 5',
        capacity: 12,
        description: 'Premium boardroom with high-end AV equipment',
        createdAt: new Date(),
      },
    ];

    await spaceRepository.save(spaces);
    this.logger.log(`Seeded ${spaces.length} spaces`);
  }
}
