import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { BrokerModule } from './broker/broker.module';
import { ClearingModule } from './clearing/clearing.module';
import { MSSocket } from './MSSocket';
import { Order, OrderSchema } from './order/schemas/Order.schema';
import { PricingModule } from './pricing/pricing.module';
import { ShareModule } from './share/share.module';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get<string>('MONGO_CONNECTION'),
        };
      },
    }),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    // BullModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     redis: {
    //       host: configService.get('REDIS_HOST'),
    //       port: configService.get('REDIS_PORT'),
    //       password: configService.get('REDIS_PW'),
    //     },
    //   }),
    // }),
    // OrderModule,
    // QueueModule,
    BrokerModule,
    ShareModule,
    ClearingModule,
    // MarketModule,
    PricingModule,
    InvoiceModule,
    // OrderbookModule,
  ],
  controllers: [AppController],
  providers: [MSSocket],
})
export class AppModule {}
