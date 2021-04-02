import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LimitAndAmount } from './models/LimitAndAmount.model';
import { Orderbook } from './models/Orderbook.model';
import { OrderbookService } from './orderbook.service';

@ApiTags('Orderbook')
@Controller('orderbook')
export class OrderbookController {
  constructor(private readonly orderbookService: OrderbookService) {}

  @Get('limitsAndAmounts/:shareId')
  async getLimitsAndAmounts(
    @Param('shareId') shareId: string,
  ): Promise<LimitAndAmount[]> {
    return this.orderbookService.getLimitsAndAmounts(shareId);
  }

  @Get(':shareId')
  async getOrderbook(
    @Param('shareId') shareId: string,
    @Query('limit') limit?: number,
  ): Promise<Orderbook> {
    return this.orderbookService.getOrderbook(shareId, +limit);
  }
}
