import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { VerifyCallback } from 'jsonwebtoken';
import { isValidObjectId, Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Broker } from '../schemas/Broker.schema';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    @InjectModel(Broker.name) private readonly brokerModel: Model<Broker>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: Broker, done: VerifyCallback): Promise<void> {
    if (payload && payload.id && isValidObjectId(payload.id)) {
      const broker = await this.brokerModel.findOne({
        _id: payload.id,
        banned: { $exists: false },
      });

      if (broker) {
        try {
          done(null, payload);
        } catch (error) {
          throw new UnauthorizedException('Unauthorized', error.message);
        } finally {
          return;
        }
      }
    }
    throw new UnauthorizedException('Unauthorized');
  }
}
