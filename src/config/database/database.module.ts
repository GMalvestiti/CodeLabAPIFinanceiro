import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        logging: configService.get('DB_LOGGING') === 'true' ? true : ['error'],
        // Apenas bom para ambiente de desenvolvimento
        // synchronize: configService.get('DB_SYNCHRONIZE') || false,
        // autoLoadEntities: configService.get('DB_SYNCHRONIZE') || false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
