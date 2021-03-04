import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { MSBroker } from 'src/broker/broker.decorator';
import { BrokerModel } from 'src/broker/models/Broker.model';
import { PlaceOrderDto } from './dtos/PlaceOrder.dto';
import { OrderService } from './order.service';
import { Order } from './schemas/Order.schema';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async placeOrder(
    @MSBroker() broker: BrokerModel,
    @Body() order: PlaceOrderDto,
  ): Promise<Order> {
    return this.orderService.placeOrder(broker, order);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delteOrder(
    @MSBroker() broker: BrokerModel,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.orderService.deleteOrder(broker, id);
  }

  @Get('orderbook')
  printOrderBook(): void {
    this.orderService.printOrderBook('6037e67c8407c737441517d6');
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getOrder(
    @MSBroker() broker: BrokerModel,
    @Param('id') id: string,
  ): Promise<Order> {
    return this.orderService.getOrder(broker, id);
  }

  @Get('test/:type/:amount')
  async testOrder(
    @Param('type') type: 'buy' | 'sell',
    @Param('amount') amount: number,
  ): Promise<Order> {
    return this.orderService.placeOrder(
      { displayName: 'Tester #1', id: 'Test', type: 'private' },
      {
        amount: +amount,
        type: type,
        shareId: '6037e67c8407c737441517d6',
        onComplete: 'dkwoadjwaidjaw',
        onMatch: 'dwioajdiawjdi',
        onDelete: 'daw',
      },
    );
  }

  @Get('test/:type/:amount/:limit')
  async testOrderLimit(
    @Param('type') type: 'buy' | 'sell',
    @Param('amount') amount: number,
    @Param('limit') limit: number,
  ): Promise<Order> {
    return this.orderService.placeOrder(
      { displayName: 'Tester #1', id: 'Test', type: 'private' },
      {
        amount: +amount,
        limit: +limit,
        type: type,
        shareId: '6037e67c8407c737441517d6',
        onComplete: 'dkwoadjwaidjaw',
        onMatch: 'dwioajdiawjdi',
        onDelete: 'dwadawd',
      },
    );
  }
}
