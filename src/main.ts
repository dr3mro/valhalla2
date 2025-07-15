import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app/app.module';

dotenv.config();

export async function bootstrap() {
  let app: NestExpressApplication | NestFastifyApplication | null = null;

  if (process.env.HTTP_ADAPTER === 'express') {
    app = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter(),
    );
  } else if (process.env.HTTP_ADAPTER === 'fastify') {
    app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
    );
  } else {
    console.error('Please specify HTTP Adapter in env.');
    process.exit(1); // early exit to avoid unsafe call
  }

  // Now TypeScript knows `app` is not null
  app.setGlobalPrefix('api/v2').enableCors();

  const config = new DocumentBuilder()
    .setTitle('Valhalla 2.0 API')
    .setDescription('This is the API documentation for Valhalla 2.0')
    .setVersion('2.0')
    .addTag('Health Care')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/v2/', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

if (require.main === module) {
  bootstrap().catch((error) => {
    console.error('Error during application bootstrap:', error);
    process.exit(1);
  });
}
