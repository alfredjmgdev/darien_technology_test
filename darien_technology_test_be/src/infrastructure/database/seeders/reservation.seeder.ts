import { BaseSeeder } from './base.seeder';
import { ReservationEntity } from '../../database/entities/reservation.entity';
import { SpaceEntity } from '../../database/entities/space.entity';
import * as moment from 'moment';

export class ReservationSeeder extends BaseSeeder {
  async seed(): Promise<void> {
    this.logger.log('Seeding reservations...');

    const reservationRepository =
      this.dataSource.getRepository(ReservationEntity);
    const spaceRepository = this.dataSource.getRepository(SpaceEntity);

    // Check if reservations already exist
    const count = await reservationRepository.count();

    if (count > 0) {
      this.logger.log('Reservations already seeded');
      return;
    }

    // Get all spaces
    const spaces = await spaceRepository.find();
    if (spaces.length === 0) {
      this.logger.warn('No spaces found. Cannot seed reservations.');
      return;
    }

    const today = moment().startOf('day');
    const tomorrow = moment(today).add(1, 'day');
    const nextWeek = moment(today).add(7, 'days');

    const reservations = [
      {
        spaceId: spaces[0].id,
        userEmail: 'user1@example.com',
        reservationDate: today.toDate(),
        startTime: moment(today).add(9, 'hours').toDate(),
        endTime: moment(today).add(11, 'hours').toDate(),
        createdAt: new Date(),
      },
      {
        spaceId: spaces[0].id,
        userEmail: 'user1@example.com',
        reservationDate: nextWeek.toDate(),
        startTime: moment(nextWeek).add(14, 'hours').toDate(),
        endTime: moment(nextWeek).add(16, 'hours').toDate(),
        createdAt: new Date(),
      },
      {
        spaceId: spaces[1].id,
        userEmail: 'user1@example.com',
        reservationDate: today.toDate(),
        startTime: moment(today).add(13, 'hours').toDate(),
        endTime: moment(today).add(15, 'hours').toDate(),
        createdAt: new Date(),
      },
      {
        spaceId: spaces[1].id,
        userEmail: 'user1@example.com',
        reservationDate: nextWeek.toDate(),
        startTime: moment(nextWeek).add(14, 'hours').toDate(),
        endTime: moment(nextWeek).add(16, 'hours').toDate(),
        createdAt: new Date(),
      },
      {
        spaceId: spaces[2].id,
        userEmail: 'user2@example.com',
        reservationDate: tomorrow.toDate(),
        startTime: moment(tomorrow).add(6, 'hours').toDate(),
        endTime: moment(tomorrow).add(7, 'hours').toDate(),
        createdAt: new Date(),
      },
      {
        spaceId: spaces[2].id,
        userEmail: 'user2@example.com',
        reservationDate: tomorrow.toDate(),
        startTime: moment(tomorrow).add(10, 'hours').toDate(),
        endTime: moment(tomorrow).add(12, 'hours').toDate(),
        createdAt: new Date(),
      },
      {
        spaceId: spaces[2].id,
        userEmail: 'user1@example.com',
        reservationDate: nextWeek.toDate(),
        startTime: moment(nextWeek).add(14, 'hours').toDate(),
        endTime: moment(nextWeek).add(16, 'hours').toDate(),
        createdAt: new Date(),
      },
      {
        spaceId: spaces[3].id,
        userEmail: 'user1@example.com',
        reservationDate: nextWeek.toDate(),
        startTime: moment(nextWeek).add(9, 'hours').toDate(),
        endTime: moment(nextWeek).add(17, 'hours').toDate(),
        createdAt: new Date(),
      },
      {
        spaceId: spaces[3].id,
        userEmail: 'user1@example.com',
        reservationDate: nextWeek.toDate(),
        startTime: moment(nextWeek).add(6, 'hours').toDate(),
        endTime: moment(nextWeek).add(7, 'hours').toDate(),
        createdAt: new Date(),
      },
      {
        spaceId: spaces[4].id,
        userEmail: 'user1@example.com',
        reservationDate: nextWeek.toDate(),
        startTime: moment(nextWeek).add(9, 'hours').toDate(),
        endTime: moment(nextWeek).add(17, 'hours').toDate(),
        createdAt: new Date(),
      },
      {
        spaceId: spaces[4].id,
        userEmail: 'user1@example.com',
        reservationDate: nextWeek.toDate(),
        startTime: moment(nextWeek).add(6, 'hours').toDate(),
        endTime: moment(nextWeek).add(7, 'hours').toDate(),
        createdAt: new Date(),
      },
    ];

    await reservationRepository.save(reservations);
    this.logger.log(`Seeded ${reservations.length} reservations`);
  }
}
