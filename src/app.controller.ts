import { Controller, Get, Render } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { Order } from './order/schemas/Order.schema';

@Controller()
export class AppController {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  @ApiExcludeEndpoint(true)
  @Get()
  @Render('index.hbs')
  renderIndex() {
    // no op
  }

  @ApiExcludeEndpoint(true)
  @Get('trading')
  @Render('trading.hbs')
  renderTrading() {
    // no op
  }
}
