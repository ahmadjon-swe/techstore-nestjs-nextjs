import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ImageService } from './image.service';
import { MediaController } from './media.controller';

@Module({
  imports: [
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          rootPath: join(process.cwd(), config.get<string>('UPLOAD_DIR', './uploads')),
          serveRoot: '/uploads',
        },
      ],
    }),
  ],
  providers: [ImageService],
  controllers: [MediaController],
  exports: [ImageService],
})
export class MediaModule {}
