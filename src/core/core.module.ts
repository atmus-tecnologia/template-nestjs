import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import path from 'path';
import { BullConfigService, CacheConfigService, ThrottlerConfigService, TypeOrmConfigService } from './services';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ThrottlerModule.forRootAsync({
      useClass: ThrottlerConfigService,
    }),
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join('storage'),
      renderPath: 'uploads',
    }),
  ],
})
export class CoreModule {}
