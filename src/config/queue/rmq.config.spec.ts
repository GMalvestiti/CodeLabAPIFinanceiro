import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { rmqConfig } from './rmq.config';

describe('RMQ Configurations', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as unknown as ConfigService;
  });

  it('should create RMQ configuration', () => {
    const queue = 'test_queue';
    const user = 'guest';
    const password = 'guest';
    const host = 'localhost';
    const port = 5672;

    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      switch (key) {
        case 'RMQ_USER':
          return user;
        case 'RMQ_PASSWORD':
          return password;
        case 'RMQ_HOST':
          return host;
        case 'RMQ_PORT':
          return port;
        default:
          return null;
      }
    });

    const result: RmqOptions = rmqConfig(configService, queue);

    expect(result).toEqual({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${user}:${password}@${host}:${port}`],
        queue,
        prefetchCount: 1,
        queueOptions: {
          durable: true,
        },
        persistent: true,
      },
    });
  });
});
