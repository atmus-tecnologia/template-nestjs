import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { OpenAIModuleAsyncOptions, OpenAIModuleOptions } from './module-options.interface';
import { OpenAIService } from './openai.service';

@Global()
@Module({})
export class OpenAIModule {
  static register(options: OpenAIModuleOptions): DynamicModule {
    return {
      module: OpenAIModule,
      providers: [
        {
          provide: 'OPENAI_CONFIG_OPTIONS',
          useValue: options,
        },
        OpenAIService,
      ],
      exports: [OpenAIService],
    };
  }

  static registerAsync(options: OpenAIModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: OpenAIModule,
      imports: options.imports || [],
      providers: [...asyncProviders, OpenAIService],
      exports: [OpenAIService],
    };
  }

  private static createAsyncProviders(options: OpenAIModuleAsyncOptions): Provider[] {
    return [
      {
        provide: 'OPENAI_CONFIG_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
    ];
  }
}
