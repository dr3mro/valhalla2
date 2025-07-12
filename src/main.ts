import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UpdateUserDto } from './users/dto/update-user.dto';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v2');

  const config = new DocumentBuilder()
    .setTitle('Valhalla 2.0 API')
    .setDescription('This is the API documentation for Valhalla 2.0')
    .setVersion('2.0')
    .addTag('Health Care')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      extraModels: [CreateUserDto, UpdateUserDto],
    });
  SwaggerModule.setup('api/v2', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}

if (require.main === module) {
  bootstrap().catch((error) => {
    console.error('Error during application bootstrap:', error);
  });
}
