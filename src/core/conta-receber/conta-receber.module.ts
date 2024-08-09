import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Closeable,
} from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { grpcClientConfig } from '../../config/grpc/grpc.config';
import { ExportPdfService } from '../../shared/services/export-pdf.service';
import { RmqClientService } from '../../shared/services/rmq-client.service';
import { ContaReceberController } from './conta-receber.controller';
import { ContaReceberService } from './conta-receber.service';
import { ContaReceber } from './entities/conta-receber.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContaReceber])],
  controllers: [ContaReceberController],
  providers: [
    ContaReceberService,
    ExportPdfService,
    RmqClientService,
    {
      provide: 'MAIL_SERVICE',
      useFactory: async (
        rmqClientService: RmqClientService,
      ): Promise<ClientProxy & Closeable> => {
        return rmqClientService.createRabbitmqOptions('mail.enviar-email');
      },
      inject: [RmqClientService],
    },
    {
      provide: 'GRPC_USUARIO',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create(
          grpcClientConfig('usuario', 'GRPC_USUARIO', configService),
        );
      },
      inject: [ConfigService],
    },
  ],
})
export class ContaReceberModule {}
