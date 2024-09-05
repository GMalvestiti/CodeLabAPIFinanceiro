import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './config/database/database.module';
import { ContaReceberModule } from './core/conta-receber/conta-receber.module';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: `.env${
        process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''
      }`,
      isGlobal: true,
    }),

    DatabaseModule,
    ContaReceberModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
