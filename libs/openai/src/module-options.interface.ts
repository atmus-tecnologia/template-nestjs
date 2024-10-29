import { ModuleMetadata } from '@nestjs/common';
import { ClientOptions } from 'openai';

export type OpenAIModuleOptions = ClientOptions;

export interface OpenAIModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<OpenAIModuleOptions> | OpenAIModuleOptions;
  inject?: any[];
}
