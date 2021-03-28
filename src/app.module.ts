import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { BrokerModule } from './broker/broker.module';
import { ClearingModule } from './clearing/clearing.module';
import { MarketModule } from './market/market.module';
import { MSSocket } from './MSSocket';
import { OrderModule } from './order/order.module';
import { QueueModule } from './queue/queue.module';
import { ShareModule } from './share/share.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get<string>('MONGO_CONNECTION'),
        };
      },
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          username: configService.get('REDIS_USER'),
          password: configService.get('REDIS_PW'),
        },
      }),
    }),
    OrderModule,
    BrokerModule,
    ShareModule,
    ClearingModule,
    MarketModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [MSSocket],
})
export class AppModule {}
