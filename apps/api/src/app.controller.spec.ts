import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: PrismaService,
          useValue: { $queryRaw: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('health returns ok status', () => {
    const result = appController.health();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });

  it('ready returns ok when db is up', async () => {
    const result = await appController.ready();
    expect(result.status).toBe('ok');
    expect(result.db).toBe('up');
  });
});
