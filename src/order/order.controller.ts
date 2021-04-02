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
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { MSBroker } from 'src/broker/broker.decorator';
import { BrokerTypeGuard, BrokerTypes } from 'src/broker/brokerType.guard';
import { BrokerModel } from 'src/broker/models/Broker.model';
import { QueuedJob } from 'src/queue/dtos/QueuedJob.dto';
import { DeleteOrderDto } from './dtos/DeleteOrder.dto';
import { PlaceOrderDto } from './dtos/PlaceOrder.dto';
import { UnqueueJobDto } from './dtos/UnqueueJob.dto';
import { OrderService } from './order.service';
import { Order } from './schemas/Order.schema';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async placeOrder(
    @MSBroker() broker: BrokerModel,
    @Body() dto: PlaceOrderDto,
  ): Promise<QueuedJob> {
    return this.orderService.placeRequest(dto, broker);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete()
  async deleteOrder(
    @MSBroker() broker: BrokerModel,
    @Body() dto: DeleteOrderDto | UnqueueJobDto,
  ): Promise<QueuedJob | boolean> {
    return this.orderService.deleteRequest(dto, broker);
  }

  // TODO: REMOVE IN LATER BUILD ~Timo
  @ApiBearerAuth()
  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Get('orders')
  async getOrders(): Promise<Order[]> {
    return this.orderService.getOrders();
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'id', example: '6053133b6f29c24f4851dd7e' })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getOrderStatus(
    @MSBroker() broker: BrokerModel,
    @Param('id') id: string,
  ): Promise<Order> {
    return this.orderService.getOrder(broker, id);
  }
}
