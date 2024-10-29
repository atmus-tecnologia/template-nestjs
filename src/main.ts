import 'dotenv/config';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as awsConfig } from 'aws-sdk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { AppModule } from './app.module';

const logger = new Logger('Main');
async function bootstrap() {
  // ** Create the application and enable CORS
  const app = await NestFactory.create(AppModule);

  // ** Enable CORS
  app.enableCors();

  // ** Enable route versioning
  app.enableVersioning();

  // ** Enable global class-validator
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // ** Global configuration for lib aws-sdk
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION) {
    awsConfig.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  // ** Start the application
  await app.listen(Number(process.env.PORT) || 3001);

  // ** Print application information
  logger.log(`Application listening on: ${await app.getUrl()}`);
}

// ** Show application banner and start the application
figlet(process.env.APP_NAME, (_, screen) => {
  console.log(gradient.vice(screen));
  console.log(`-> ${gradient.cristal('Environment:')} ${process.env.NODE_ENV}`);
  console.log();
  bootstrap().catch(error => {
    logger.error(error);
    process.exit(1);
  });
});
