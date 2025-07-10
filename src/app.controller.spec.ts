import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should call appService.getHello and return the result', () => {
      const mockResult = 'Mocked Hello World!';
      jest.spyOn(appService, 'getHello').mockReturnValue(mockResult);

      expect(appController.getHello()).toBe(mockResult);
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });
  });
});
