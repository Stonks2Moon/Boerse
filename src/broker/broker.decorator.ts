import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { BrokerModel } from './models/Broker.model';

export const MSBroker = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): BrokerModel => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
