import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../../domain/entities/user.entity';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let configService: ConfigService;
  let userRepository: {
    findById: jest.Mock;
    findByEmail: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockUser = new User();
  mockUser.id = 1;
  mockUser.email = 'test@example.com';
  mockUser.name = 'Test User';

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: 'UserRepositoryPort',
          useValue: userRepository,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('constructor', () => {
    it('should throw UnauthorizedException if JWT_SECRET is not defined', () => {
      configService.get = jest.fn().mockReturnValue(undefined);

      expect(() => {
        new JwtStrategy(configService, userRepository);
      }).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if JWT_SECRET is empty', () => {
      configService.get = jest.fn().mockReturnValue('');

      expect(() => {
        new JwtStrategy(configService, userRepository);
      }).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if JWT_SECRET is not a string', () => {
      configService.get = jest.fn().mockReturnValue(123);

      expect(() => {
        new JwtStrategy(configService, userRepository);
      }).toThrow(UnauthorizedException);
    });
  });

  describe('validate', () => {
    it('should return user data if user exists', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const payload = { sub: 1, email: 'test@example.com' };
      const result = await jwtStrategy.validate(payload);

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
      });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      const payload = { sub: 999, email: 'nonexistent@example.com' };

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.findById).toHaveBeenCalledWith(999);
    });
  });
});
