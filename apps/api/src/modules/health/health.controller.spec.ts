import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;

  const mockHealthCheckResult = {
    status: 'ok',
    info: {},
    error: {},
    details: {},
  };

  const healthCheckService = {
    check: jest.fn().mockResolvedValue(mockHealthCheckResult),
  };
  const databaseIndicator = {
    pingCheck: jest.fn().mockResolvedValue({ postgres: { status: 'up' } }),
  };
  const memoryIndicator = {
    checkHeap: jest
      .fn()
      .mockResolvedValue({ memory_heap: { status: 'up' } }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: healthCheckService },
        { provide: TypeOrmHealthIndicator, useValue: databaseIndicator },
        { provide: MemoryHealthIndicator, useValue: memoryIndicator },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkLiveness', () => {
    it('should call health.check and return result', async () => {
      const result = await controller.checkLiveness();
      expect(healthCheckService.check).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockHealthCheckResult);
    });

    it('should use memory heap indicator', async () => {
      healthCheckService.check.mockImplementationOnce(async (indicators) => {
        await indicators[0]();
        return mockHealthCheckResult;
      });

      await controller.checkLiveness();
      expect(memoryIndicator.checkHeap).toHaveBeenCalledWith(
        'memory_heap',
        500 * 1024 * 1024,
      );
    });
  });

  describe('checkReadiness', () => {
    it('should call health.check and return result', async () => {
      const result = await controller.checkReadiness();
      expect(healthCheckService.check).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockHealthCheckResult);
    });

    it('should use database ping check', async () => {
      healthCheckService.check.mockImplementationOnce(async (indicators) => {
        await indicators[0]();
        return mockHealthCheckResult;
      });

      await controller.checkReadiness();
      expect(databaseIndicator.pingCheck).toHaveBeenCalledWith('postgres');
    });
  });
});
