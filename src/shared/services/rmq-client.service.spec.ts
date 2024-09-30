import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { rmqConfig } from '../../config/queue/rmq.config';
import { RmqClientService } from './rmq-client.service';

jest.mock('@nestjs/microservices', () => ({
  ClientProxyFactory: {
    create: jest.fn(),
  },
}));

jest.mock('../../config/queue/rmq.config', () => ({
  rmqConfig: jest.fn(),
}));

describe('RmqClientService', () => {
  let service: RmqClientService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RmqClientService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RmqClientService>(RmqClientService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create RabbitMQ client options', async () => {
    const queue = 'testQueue';
    const mockClientProxy = {} as ClientProxy;
    const mockRmqConfig = {
      transport: 'RABBITMQ',
      options: {
        urls: ['amqp://localhost'],
        queue,
      },
    };

    (rmqConfig as jest.Mock).mockReturnValue(mockRmqConfig);
    (ClientProxyFactory.create as jest.Mock).mockReturnValue(mockClientProxy);

    const client = await service.createRabbitmqOptions(queue);

    expect(client).toBe(mockClientProxy);
    expect(rmqConfig).toHaveBeenCalledWith(configService, queue);
    expect(ClientProxyFactory.create).toHaveBeenCalledWith(mockRmqConfig);
  });
});
