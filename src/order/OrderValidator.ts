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
    const {
      amount,
      limit,
      onPlace,
      onComplete,
      onDelete,
      type,
      onMatch,
      stop,
    } = order;

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

    if (!onPlace || onPlace.length === 0) {
      throw new UnprocessableEntityException(
        'Please provide a callback for when an order is placed',
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

    if (!onDelete || onDelete.length === 0) {
      throw new UnprocessableEntityException(
        'Please provide a callback for when an order is deleted',
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

    if (stop && typeof stop !== 'number') {
      throw new UnprocessableEntityException('Stop needs to be of type number');
    }

    if (stop < 0) {
      throw new UnprocessableEntityException('Stop must be greater than zero');
    }

    return {
      shareId: order.shareId,
      amount: order.amount,
      onPlace: order.onPlace,
      onMatch: order.onMatch,
      onComplete: order.onComplete,
      onDelete: order.onDelete,
      type: order.type,
      limit: order.limit,
      stop: stop <= 0 ? undefined : stop,
    };
  }
}
