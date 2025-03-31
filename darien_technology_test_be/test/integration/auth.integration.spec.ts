import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../src/infrastructure/database/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

describe('Authentication Integration Tests', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let authToken: string;

  const testUser = {
    email: 'integration-test@example.com',
    password: 'password123',
    name: 'Integration Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    // Clean up test user if it exists
    await userRepository.delete({ email: testUser.email });
  });

  afterAll(async () => {
    // Clean up
    await userRepository.delete({ email: testUser.email });
    await app.close();
  });

  describe('User Registration', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data).toHaveProperty('id');

      // Verify user was created in the database
      const createdUser = await userRepository.findOne({
        where: { email: testUser.email },
      });
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(testUser.email);
      expect(createdUser.name).toBe(testUser.name);

      // Verify password was hashed
      const passwordMatches = await bcrypt.compare(
        testUser.password,
        createdUser.password,
      );
      expect(passwordMatches).toBe(true);
    });

    it('should not register a user with an existing email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('User Login', () => {
    it('should login a user and return a JWT token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('access_token');

      // Save token for subsequent tests
      authToken = response.body.data.access_token;
      expect(authToken).toBeDefined();
    });

    it('should not login with incorrect credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
