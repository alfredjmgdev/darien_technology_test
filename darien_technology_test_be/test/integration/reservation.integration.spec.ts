import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SpaceEntity } from '../../src/infrastructure/database/entities/space.entity';
import { UserEntity } from '../../src/infrastructure/database/entities/user.entity';
import { ReservationEntity } from '../../src/infrastructure/database/entities/reservation.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';

describe('Reservation Management Integration Tests', () => {
  let app: INestApplication;
  let spaceRepository: Repository<SpaceEntity>;
  let userRepository: Repository<UserEntity>;
  let reservationRepository: Repository<ReservationEntity>;
  let jwtService: JwtService;
  let authToken: string;
  let createdSpaceId: number;
  let createdReservationId: number;

  const testUser = {
    email: 'reservation-test@example.com',
    password: 'password123',
    name: 'Reservation Test User',
  };

  const testSpace = {
    name: 'Reservation Test Space',
    location: 'Test Building, Floor 2',
    capacity: 8,
    description: 'Space for reservation testing',
  };

  // Create reservation for tomorrow
  const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
  const testReservation = {
    spaceId: null, // Will be set after space creation
    reservationDate: tomorrow,
    startTime: `${tomorrow}T10:00:00.000Z`,
    endTime: `${tomorrow}T12:00:00.000Z`,
  };

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
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Clean up test data
    await reservationRepository.delete({ userEmail: testUser.email });
    await spaceRepository.delete({ name: testSpace.name });
    await userRepository.delete({ email: testUser.email });

    // Create test user
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const user = await userRepository.save({
      email: testUser.email,
      password: hashedPassword,
      name: testUser.name,
      createdAt: new Date(),
    });

    // Generate JWT token
    authToken = jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    // Create test space
    const space = await spaceRepository.save({
      ...testSpace,
      createdAt: new Date(),
    });
    createdSpaceId = space.id;
    testReservation.spaceId = createdSpaceId;
  });

  afterAll(async () => {
    // Clean up
    await reservationRepository.delete({ userEmail: testUser.email });
    await spaceRepository.delete({ id: createdSpaceId });
    await userRepository.delete({ email: testUser.email });
    await app.close();
  });

  describe('Reservation Creation', () => {
    it('should create a new reservation', async () => {
      const response = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testReservation)
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Reservation created successfully');
      expect(response.body.data).toHaveProperty('id');

      createdReservationId = response.body.data.id;

      // Verify reservation was created in the database
      const createdReservation = await reservationRepository.findOne({
        where: { id: createdReservationId },
      });
      expect(createdReservation).toBeDefined();
      expect(createdReservation.spaceId).toBe(testReservation.spaceId);
      expect(createdReservation.userEmail).toBe(testUser.email);

      // Dates need special comparison due to timezone and format differences
      expect(
        moment(createdReservation.reservationDate).format('YYYY-MM-DD'),
      ).toBe(moment(testReservation.reservationDate).format('YYYY-MM-DD'));
    });

    it('should not allow double booking of the same space', async () => {
      const response = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testReservation)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBe(
        'Space is already reserved for this time',
      );
    });
  });

  describe('Reservation Retrieval', () => {
    it('should get all reservations with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty('reservations');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.reservations)).toBe(true);

      // Verify our created reservation is in the list
      const foundReservation = response.body.data.reservations.find(
        (reservation) => reservation.id === createdReservationId,
      );
      expect(foundReservation).toBeDefined();
      expect(foundReservation.spaceId).toBe(testReservation.spaceId);
      expect(foundReservation.userEmail).toBe(testUser.email);
    });

    it('should get a specific reservation by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reservations/${createdReservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty('id', createdReservationId);
      expect(response.body.data.spaceId).toBe(testReservation.spaceId);
      expect(response.body.data.userEmail).toBe(testUser.email);
    });

    it('should return 404 for non-existent reservation', async () => {
      const nonExistentId = 9999;
      const response = await request(app.getHttpServer())
        .get(`/reservations/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toBe('Reservation not found');
    });
  });

  describe('Reservation Update', () => {
    it('should update an existing reservation', async () => {
      // Update to a different time on the same day
      const updateData = {
        startTime: `${tomorrow}T14:00:00.000Z`,
        endTime: `${tomorrow}T16:00:00.000Z`,
      };

      const response = await request(app.getHttpServer())
        .put(`/reservations/${createdReservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Reservation updated successfully');
      expect(response.body.data).toHaveProperty('id', createdReservationId);

      // Verify reservation was updated in the database
      const updatedReservation = await reservationRepository.findOne({
        where: { id: createdReservationId },
      });

      // Check that times were updated
      expect(moment(updatedReservation.startTime).format('HH:mm')).toBe(
        moment(updateData.startTime).format('HH:mm'),
      );
      expect(moment(updatedReservation.endTime).format('HH:mm')).toBe(
        moment(updateData.endTime).format('HH:mm'),
      );
    });
  });

  describe('Reservation Deletion', () => {
    it('should delete an existing reservation', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/reservations/${createdReservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Reservation deleted successfully');

      // Verify reservation was deleted from the database
      const deletedReservation = await reservationRepository.findOne({
        where: { id: createdReservationId },
      });
      expect(deletedReservation).toBeNull();
    });

    it("should not allow deletion of another user's reservation", async () => {
      // First create a new reservation
      const newReservation = {
        ...testReservation,
        startTime: `${tomorrow}T17:00:00.000Z`,
        endTime: `${tomorrow}T18:00:00.000Z`,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newReservation)
        .expect(201);

      const newReservationId = createResponse.body.data.id;

      // Create another user with different token
      const otherUser = {
        email: 'other-user@example.com',
        password: 'password123',
        name: 'Other Test User',
      };

      const hashedPassword = await bcrypt.hash(otherUser.password, 10);
      const user = await userRepository.save({
        email: otherUser.email,
        password: hashedPassword,
        name: otherUser.name,
        createdAt: new Date(),
      });

      const otherAuthToken = jwtService.sign({
        sub: user.id,
        email: user.email,
      });

      // Try to delete with different user
      const response = await request(app.getHttpServer())
        .delete(`/reservations/${newReservationId}`)
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .expect(403);

      expect(response.body.statusCode).toBe(403);
      expect(response.body.message).toBe(
        'You are not authorized to delete this reservation',
      );

      // Clean up
      await reservationRepository.delete({ id: newReservationId });
      await userRepository.delete({ email: otherUser.email });
    });
  });
});
