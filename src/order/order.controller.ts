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

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getOrder(
    @MSBroker() broker: BrokerModel,
    @Param('id') id: string,
  ): Promise<Order> {
    return this.orderService.getOrder(broker, id);
  }
}
