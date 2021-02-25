import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PlaceOrder } from './dtos/PlaceOrder.dto';
import { IOrder } from './interfaces/IOrder.interface';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('')
  async placeOrder(@Body() order: PlaceOrder): Promise<IOrder> {
    return this.orderService.placeOrder(order);
  }

  @Delete(':id')
  async delteOrder(@Param('id') id: string): Promise<boolean> {
    return this.orderService.deleteOrder(id);
  }

  @Get(':id')
  async getOrderStatus(@Param('id') id: string): Promise<IOrderStatus> {
    return this.orderService.getOrderStatus(id);
  }
}
