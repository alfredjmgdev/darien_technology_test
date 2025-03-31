import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SpaceEntity } from '../../src/infrastructure/database/entities/space.entity';
import { UserEntity } from '../../src/infrastructure/database/entities/user.entity';
import { ReservationEntity } from '../../src/infrastructure/database/entities/reservation.entity';
import { Repository } from 'typeorm';
import * as moment from 'moment';

describe('End-to-End Workflow Integration Tests', () => {
  let app: INestApplication;
  let spaceRepository: Repository<SpaceEntity>;
  let userRepository: Repository<UserEntity>;
  let reservationRepository: Repository<ReservationEntity>;

  // Test data
  const testUser = {
    email: 'workflow-test@example.com',
    password: 'password123',
    name: 'Workflow Test User',
  };

  const testSpace = {
    name: 'Workflow Test Space',
    location: 'Test Building, Floor 3',
    capacity: 12,
    description: 'Space for workflow testing',
  };

  // Create reservation for tomorrow
  const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

  // Store IDs and tokens
  let authToken: string;
  let userId: number;
  let spaceId: number;
  let reservationId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    spaceRepository = moduleFixture.get<Repository<SpaceEntity>>(
      getRepositoryToken(SpaceEntity),
    );
    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    reservationRepository = moduleFixture.get<Repository<ReservationEntity>>(
      getRepositoryToken(ReservationEntity),
    );

    // Clean up test data
    await reservationRepository.delete({ userEmail: testUser.email });
    await spaceRepository.delete({ name: testSpace.name });
    await userRepository.delete({ email: testUser.email });
  });

  afterAll(async () => {
    // Clean up
    await reservationRepository.delete({ userEmail: testUser.email });
    await spaceRepository.delete({ name: testSpace.name });
    await userRepository.delete({ email: testUser.email });
    await app.close();
  });

  describe('Complete User Journey', () => {
    it('Step 1: Register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      userId = response.body.data.id;
    });

    it('Step 2: Login with the registered user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty('access_token');
      authToken = response.body.data.access_token;
    });

    it('Step 3: Create a new space', async () => {
      const response = await request(app.getHttpServer())
        .post('/spaces')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testSpace)
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      spaceId = response.body.data.id;
    });

    it('Step 4: Verify the space was created', async () => {
      const response = await request(app.getHttpServer())
        .get(`/spaces/${spaceId}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.name).toBe(testSpace.name);
    });

    it('Step 5: Create a reservation for the space', async () => {
      const reservation = {
        spaceId: spaceId,
        reservationDate: tomorrow,
        startTime: `${tomorrow}T09:00:00.000Z`,
        endTime: `${tomorrow}T11:00:00.000Z`,
      };

      const response = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reservation)
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      reservationId = response.body.data.id;
    });

    it('Step 6: Verify the reservation was created', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.spaceId).toBe(spaceId);
      expect(response.body.data.userEmail).toBe(testUser.email);
    });

    it('Step 7: Update the reservation', async () => {
      const updateData = {
        startTime: `${tomorrow}T10:00:00.000Z`,
        endTime: `${tomorrow}T12:00:00.000Z`,
      };

      const response = await request(app.getHttpServer())
        .put(`/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Reservation updated successfully');
    });

    it('Step 8: Delete the reservation', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Reservation deleted successfully');
    });

    it('Step 9: Verify the reservation was deleted', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reservations/${reservationId}`)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toBe('Reservation not found');
    });
  });
});
