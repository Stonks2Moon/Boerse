import { UnprocessableEntityException } from '@nestjs/common';
import { PlaceOrderDto } from './dtos/PlaceOrder.dto';

const MAX_AMOUNT = 10000;
const MAX_DIGITS = 2;

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

    if (amount < 0 || amount > MAX_AMOUNT) {
      throw new UnprocessableEntityException(
        'Amount needs to be between 1 and 10000.',
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

    if (limit && limit % 1 != 0) {
      let limit_digits = limit.toString().split('.');
      if (limit_digits[1].length > MAX_DIGITS) {
        throw new UnprocessableEntityException(
          'Limit cannot have more than 2 digits',
        );
      }
    }

    if (stop && typeof stop !== 'number') {
      throw new UnprocessableEntityException('Stop needs to be of type number');
    }

    if (stop && stop < 0) {
      throw new UnprocessableEntityException('Stop must be greater than zero');
    }

    if (stop && stop % 1 != 0) {
      let stop_digits = stop.toString().split('.');
      if (stop_digits[1].length > MAX_DIGITS) {
        throw new UnprocessableEntityException(
          'Stop cannot have more than 2 digits',
        );
      }
    }

    return {
      shareId: order.shareId,
      amount: order.amount,
      onPlace: order.onPlace,
      onMatch: order.onMatch,
      onComplete: order.onComplete,
      onDelete: order.onDelete,
      type: order.type,
      limit: limit && limit > 0 ? limit : undefined,
      stop: stop && stop > 0 ? stop : undefined,
    };
  }
}
