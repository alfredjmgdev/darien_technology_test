import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const mockAppService = {
      getHealthCheck: jest.fn().mockReturnValue({
        status: 'ok',
        message: 'test-app is running on version 1.0.0',
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('healthCheck', () => {
    it('should return the health check information from the service', () => {
      // Arrange
      const expectedResult = {
        status: 'ok',
        message: 'test-app is running on version 1.0.0',
      };
      jest.spyOn(appService, 'getHealthCheck').mockReturnValue(expectedResult);

      // Act
      const result = appController.healthCheck();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(appService.getHealthCheck).toHaveBeenCalled();
    });
  });
});
