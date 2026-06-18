import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('system')
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  /** Liveness — process is up. */
  @Get('health')
  @ApiOkResponse({ description: 'Service is alive' })
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /** Readiness — process is up AND the database is reachable. */
  @Get('ready')
  @ApiOkResponse({ description: 'Service and database are ready' })
  async ready() {
    let db: 'up' | 'down' = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'up';
    } catch {
      db = 'down';
    }
    return {
      status: db === 'up' ? 'ok' : 'degraded',
      db,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
