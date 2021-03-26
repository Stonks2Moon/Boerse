import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BrokerTypeGuard, BrokerTypes } from 'src/broker/brokerType.guard';
import { MarketService, MarketStatus } from './market.service';

@ApiTags('Market')
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('isOpen')
  public async isOpen(): Promise<boolean> {
    return this.marketService.isOpen();
  }

  @Get('isClosed')
  public async isClosed(): Promise<boolean> {
    return this.marketService.isClosed();
  }

  @Get('status')
  public async getStatus(): Promise<string> {
    return this.marketService.getStatus();
  }

  @ApiBearerAuth()
  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Post('status')
  public async setStatus(
    @Body() body: { status: MarketStatus },
  ): Promise<boolean> {
    return this.marketService.setStatus(body.status);
  }

  @ApiBearerAuth()
  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Post('close')
  public async closeMarket(): Promise<boolean> {
    return this.marketService.closeMarket();
  }

  @ApiBearerAuth()
  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Post('open')
  public async openMarket(): Promise<boolean> {
    return this.marketService.openMarket();
  }
}
