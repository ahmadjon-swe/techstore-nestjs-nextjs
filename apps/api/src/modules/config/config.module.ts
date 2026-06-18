import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateEnv } from './env.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      // cwd under `nest start --watch` is apps/api, so the repo-root .env must be
      // loaded explicitly ('../../.env'); '.env' covers running from the repo root.
      envFilePath: ['.env', '../../.env'],
    }),
  ],
})
export class AppConfigModule {}
