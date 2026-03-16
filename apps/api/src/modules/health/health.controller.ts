import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';

const HEAP_THRESHOLD_BYTES = 500 * 1024 * 1024; // 500 MB

@SkipThrottle()
@ApiTags('Health Controller')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly http: HttpHealthIndicator,
  ) {}

  @Get('liveness')
  @HealthCheck()
  checkLiveness(): Promise<HealthCheckResult> {
    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        this.memory.checkHeap('memory_heap', HEAP_THRESHOLD_BYTES),
    ]);
  }

  @Get('readiness')
  @HealthCheck()
  checkReadiness(): Promise<HealthCheckResult> {
    return this.health.check([
      (): Promise<HealthIndicatorResult> => this.db.pingCheck('postgres'),
    ]);
  }

  // TODO: add health http endpoint checking
  // Example:
  @Get('http')
  @HealthCheck()
  checkHttp(): Promise<HealthCheckResult> {
    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }
}
