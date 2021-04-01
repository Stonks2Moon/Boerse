import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Render,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { BrokerTypeGuard, BrokerTypes } from 'src/broker/brokerType.guard';
import { SetPricingDto } from './dtos/SetPricing.dto';
import { PricingService } from './pricing.service';
import { Pricing } from './schemas/Pricing.schema';

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @ApiExcludeEndpoint(true)
  @Get()
  @Render('pricing.hbs')
  renderPricing() {
    // no op
  }

  @Get('all')
  async getPricings(): Promise<Pricing[]> {
    return this.pricingService.getAll();
  }

  @Get('types')
  async getPricingTypes(): Promise<string[]> {
    return this.pricingService.getTypes();
  }

  @Get(':type')
  async getPricingFor(@Param('type') type: string): Promise<Pricing> {
    return this.pricingService.getPricing(type);
  }

  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Delete(':type')
  async deletePricingType(@Param('type') type: string): Promise<void> {
    this.pricingService.deletePricing(type);
  }

  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Post()
  async setPricing(@Body() dto: SetPricingDto): Promise<Pricing> {
    return this.pricingService.setPricing(dto);
  }
}
