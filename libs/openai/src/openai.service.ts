import { Inject, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { OpenAIModuleOptions } from './module-options.interface';

@Injectable()
export class OpenAIService extends OpenAI {
  constructor(@Inject('OPENAI_CONFIG_OPTIONS') config: OpenAIModuleOptions) {
    super(config);
  }

  async teste() {
    const { data } = await this.files.list();
    console.log(data);

    // return this.files.create({
    //   purpose: 'fine-tune',
    //   file: createReadStream('mydata.jsonl'),
    // });

    return this.fineTunes.create({
      training_file: 'file-iMfsenfC66fKZbVtyuXaacgi',
      model: 'gpt-3.5-turbo-0613',
    });
  }
}
