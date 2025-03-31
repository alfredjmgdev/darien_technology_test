import { name, version } from '../package.json';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { PORT, CORS_CONFIG, SERVICE_NAME } from './constants';
import { AppModule } from './app.module';

async function httpServerBootstrap(): Promise<void> {
  try {
    const app = await NestFactory.create(AppModule, {
      cors: CORS_CONFIG,
    });
    const logger = new Logger('Logger', {
      timestamp: false,
    });
    app.useLogger(logger);
    app.use(helmet());

    const ENV = process.env.NODE_ENV ?? 'local';
    const API_HOST = ENV === 'local' ? 'localhost' : process.env.API_HOST;

    const config = new DocumentBuilder()
      .setTitle(name)
      .setDescription(`${SERVICE_NAME} - API description & documentation`)
      .setVersion(version)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(PORT, () => {
      logger.log(
        '|------------------------------------------------------------------|',
        'httpServerBootstrap',
      );
      logger.log(`| ENVIRONMENT: ${ENV}`, 'httpServerBootstrap');
      logger.log(`| SERVICE: ${SERVICE_NAME}`, 'httpServerBootstrap');
      logger.log(`| VERSION: ${version}`, 'httpServerBootstrap');
      logger.log('| WEB SERVER - REST API OK', 'httpServerBootstrap');
      logger.log(`| PATH BASE: ${API_HOST}`, 'httpServerBootstrap');
      logger.log(`| RUNNING PORT: ${PORT}`, 'httpServerBootstrap');
      logger.log(
        '|------------------------------------------------------------------|',
        'httpServerBootstrap',
      );
      logger.log(
        `| Swagger path: ${API_HOST}:${PORT}/api`,
        'httpServerBootstrap',
      );
      logger.log(
        '|------------------------------------------------------------------|',
        'httpServerBootstrap',
      );
      logger.log(
        `| SERVICE: ${SERVICE_NAME} ITS READY!!!!!`,
        'httpServerBootstrap',
      );
      logger.log(
        '|------------------------------------------------------------------|',
        'httpServerBootstrap',
      );
    });
  } catch (error) {
    console.log('ERROR: ', error);
  }
}

(async () => {
  try {
    await httpServerBootstrap();
  } catch (error) {
    console.error('Failed to bootstrap HTTP server:', error);
    process.exit(1);
  }
})().catch((error) => {
  console.error('Unhandled error during startup:', error);
  process.exit(1);
});
