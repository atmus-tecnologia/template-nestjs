import { Injectable } from '@nestjs/common';
import { ThrottlerModuleOptions, ThrottlerOptionsFactory } from '@nestjs/throttler';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  createThrottlerOptions(): ThrottlerModuleOptions {
    return {
      ttl: Number(process.env.THROTTLE_TTL) || 60,
      limit: Number(process.env.THROTTLE_LIMIT) || 10,
    };
  }
}
