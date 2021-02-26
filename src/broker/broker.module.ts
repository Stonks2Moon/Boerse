import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { BrokerController } from './broker.controller';
import { BrokerService } from './broker.service';
import { Broker, BrokerSchema } from './schemas/Broker.schema';
import { JWTStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Broker.name, schema: BrokerSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
        };
      },
    }),
  ],
  providers: [BrokerService, JWTStrategy],
  controllers: [BrokerController],
})
export class BrokerModule {}
