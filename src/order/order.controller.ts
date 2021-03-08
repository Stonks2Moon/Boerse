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
import { BrokerTypeGuard, BrokerTypes } from 'src/broker/brokerType.guard';
import { BrokerModel } from 'src/broker/models/Broker.model';
import { DeleteOrderDto } from './dtos/DeleteOrder.dto';
import { PlaceOrderDto } from './dtos/PlaceOrder.dto';
import { QueuedJob } from './dtos/QueueItem.dto';
import { UnqueueJobDto } from './dtos/UnqueueJob.dto';
import { OrderService } from './order.service';
import { QueueService } from './queue.service';
import { Order } from './schemas/Order.schema';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly queueService: QueueService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async placeOrder(
    @MSBroker() broker: BrokerModel,
    @Body() dto: PlaceOrderDto,
  ): Promise<QueuedJob> {
    return this.queueService.placeRequest(dto, broker);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete()
  async deleteOrder(
    @MSBroker() broker: BrokerModel,
    @Body() dto: DeleteOrderDto | UnqueueJobDto,
  ): Promise<QueuedJob | boolean> {
    return this.queueService.deleteRequest(dto, broker);
  }

  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Get('orders')
  async getOrders(): Promise<Order[]> {
    return this.orderService.getOrders();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getOrderStatus(
    @MSBroker() broker: BrokerModel,
    @Param('id') id: string,
  ): Promise<Order> {
    return this.orderService.getOrder(broker, id);
  }
}
