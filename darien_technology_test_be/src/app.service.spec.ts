import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { name, version } from '../package.json';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealthCheck', () => {
    it('should return the correct health check response', () => {
      const expectedResponse = {
        status: 'ok',
        message: `${name} is running on version ${version}`,
      };

      const result = service.getHealthCheck();

      expect(result).toEqual(expectedResponse);
    });

    it('should include the correct application name and version', () => {
      const result = service.getHealthCheck();

      expect(result.status).toBe('ok');
      expect(result.message).toContain(name);
      expect(result.message).toContain(version);
    });
  });
});
