import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { BrokerModel } from './models/Broker.model';

export const BrokerTypes = (types: string[]) =>
  SetMetadata('BrokerTypes', types);

@Injectable()
export class BrokerTypeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const types = this.reflector.get<string[]>(
      'BrokerTypes',
      context.getHandler(),
    );

    if (!types || !types.length) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user as BrokerModel;

    return types.some((t) => t.toLowerCase() === user.type);
  }
}
