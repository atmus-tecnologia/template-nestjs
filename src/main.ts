import 'dotenv/config';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
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
