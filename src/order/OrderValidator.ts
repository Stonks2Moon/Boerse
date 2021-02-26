import { UnprocessableEntityException } from '@nestjs/common';
import { PlaceOrderDto } from './dtos/PlaceOrder.dto';

// shareId: string;
//   amount: number;

//   onMatch?: string;
//   onComplete: string;

//   type: 'buy' | 'sell';
//   limit: number;

//   stop?: number;
//   stopLimit?: number;
export class OrderValidator {
  public static validate(order: PlaceOrderDto): PlaceOrderDto {
    const { amount, limit, onComplete, type, onMatch, stop, stopLimit } = order;

    if (!amount || typeof amount !== 'number') {
      throw new UnprocessableEntityException(
        'Amount needs to be assigned and of type number',
      );
    }
    if (amount < 0) {
      throw new UnprocessableEntityException(
        'Amount must be greater than zero',
      );
    }

    if (!onMatch || onMatch.length === 0) {
      throw new UnprocessableEntityException(
        'Please provide a callback for when an order is matched',
      );
    }

    if (!onComplete || onComplete.length === 0) {
      throw new UnprocessableEntityException(
        'Please provide a callback for when an order is completed',
      );
    }

    if (!type || !(type === 'buy' || type === 'sell')) {
      throw new UnprocessableEntityException(
        "Please specify your order type. Available types are 'sell' and 'buy'",
      );
    }

    if (limit && typeof limit !== 'number') {
      throw new UnprocessableEntityException(
        'Limit needs to be of type number',
      );
    }
    if (!limit) order.limit = -1;

    if (stop && typeof stop !== 'number') {
      throw new UnprocessableEntityException('Stop needs to be of type number');
    }
    if (stop < 0) {
      throw new UnprocessableEntityException('Stop must be greater than zero');
    }

    if (stopLimit && typeof stopLimit !== 'number') {
      throw new UnprocessableEntityException(
        'StopLimit needs to be of type number',
      );
    }

    if (stopLimit && !stop) {
      throw new UnprocessableEntityException(
        'StopLimit cant be provided without a given stop',
      );
    }

    if (stop && typeof stop === 'number' && !stopLimit) order.stopLimit = -1;

    return {
      shareId: order.shareId,
      amount: order.amount,
      onMatch: order.onMatch,
      onComplete: order.onComplete,
      type: order.type,
      limit: order.limit,
      stop: order.stop,
      stopLimit: order.stopLimit,
    };
  }
}
