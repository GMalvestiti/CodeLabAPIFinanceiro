import { ConfigService } from '@nestjs/config';
import {
  GrpcOptions,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import { join } from 'path';
import { grpcClientConfig, grpcConfig } from './grpc.config';

describe('gRPC Configurations', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as unknown as ConfigService;
  });

  it('should create gRPC configuration', () => {
    const packageName = 'usuario';
    const urlEnv = 'GRPC_URL';
    const grpcUrl = 'localhost:5000';

    jest.spyOn(configService, 'get').mockReturnValue(grpcUrl);

    const result: MicroserviceOptions = grpcConfig(
      packageName,
      urlEnv,
      configService,
    );

    expect(result).toEqual({
      transport: Transport.GRPC,
      options: {
        package: packageName,
        protoPath: join(__dirname, `protos/${packageName}.proto`),
        url: grpcUrl,
      },
    });
  });

  it('should create gRPC client configuration', () => {
    const packageName = 'usuario';
    const urlEnv = 'GRPC_CLIENT_URL';
    const grpcClientUrl = 'localhost:5001';

    jest.spyOn(configService, 'get').mockReturnValue(grpcClientUrl);

    const result: GrpcOptions = grpcClientConfig(
      packageName,
      urlEnv,
      configService,
    );

    expect(result).toEqual({
      transport: Transport.GRPC,
      options: {
        package: packageName,
        protoPath: join(__dirname, `protos/${packageName}.proto`),
        url: grpcClientUrl,
      },
    });
  });
});
