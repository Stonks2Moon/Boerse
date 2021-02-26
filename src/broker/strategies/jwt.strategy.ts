import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { VerifyCallback } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: object, done: VerifyCallback): Promise<void> {
    try {
      done(null, payload);
    } catch (error) {
      throw new UnauthorizedException('Unauthorized', error.message);
    }
  }
}
