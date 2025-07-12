import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

describe('main.ts', () => {
  let createNestApplicationSpy: jest.SpyInstance;
  let listenSpy: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock process.env.PORT to avoid port conflicts
    process.env.PORT = '0'; // Use a random available port

    listenSpy = jest.fn().mockResolvedValue(undefined);
    const mockApp = {
      listen: listenSpy,
      useGlobalPipes: jest.fn(),
      useGlobalInterceptors: jest.fn(),
      setGlobalPrefix: jest.fn(),
      enableVersioning: jest.fn(),
      enableCors: jest.fn(),
      useStaticAssets: jest.fn(),
      getHttpAdapter: jest.fn(() => ({
        get: jest.fn(),
        getType: jest.fn(() => 'express'),
      })),
    };
    createNestApplicationSpy = jest
      .spyOn(NestFactory, 'create')
      .mockResolvedValue(mockApp as any);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    createNestApplicationSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should bootstrap the application', async () => {
    const { bootstrap } = require('./main');
    await bootstrap();

    expect(createNestApplicationSpy).toHaveBeenCalledWith(AppModule);
    expect(listenSpy).toHaveBeenCalledWith('0');
  });

  it('should log an error if bootstrap fails', async () => {
    jest.resetModules(); // Clear module cache for this test
    const { NestFactory } = require('@nestjs/core'); // Re-require NestFactory
    const createNestApplicationSpy = jest.spyOn(NestFactory, 'create'); // Re-spy

    const { bootstrap } = require('./main'); // Now require main.ts
    await bootstrap();
  });
});
