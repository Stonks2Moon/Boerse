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
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BrokerTypeGuard, BrokerTypes } from 'src/broker/brokerType.guard';
import { SetPricingDto } from './dtos/SetPricing.dto';
import { PricingService } from './pricing.service';
import {
  PARAM_TYPE,
  RESPONSE_AVAILABLE_PRICINGS,
  RESPONSE_DELETE_PRICING_FOR_TYPE,
  RESPONSE_PRICING_FOR_TYPE,
  RESPONSE_PRICING_TYPES,
  RESPONSE_SET_PRICING,
} from './Pricing.swagger';
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

  @ApiResponse(RESPONSE_AVAILABLE_PRICINGS)
  @Get('all')
  async getPricings(): Promise<Pricing[]> {
    return this.pricingService.getAll();
  }

  @ApiResponse(RESPONSE_PRICING_TYPES)
  @Get('types')
  async getPricingTypes(): Promise<string[]> {
    return this.pricingService.getTypes();
  }

  @ApiParam(PARAM_TYPE)
  @ApiResponse(RESPONSE_PRICING_FOR_TYPE)
  @Get(':type')
  async getPricingFor(@Param('type') type: string): Promise<Pricing> {
    return this.pricingService.getPricing(type);
  }

  @ApiBearerAuth()
  @ApiParam(PARAM_TYPE)
  @ApiResponse(RESPONSE_DELETE_PRICING_FOR_TYPE)
  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Delete(':type')
  async deletePricingType(@Param('type') type: string): Promise<void> {
    this.pricingService.deletePricing(type);
  }

  @ApiBearerAuth()
  @ApiResponse(RESPONSE_SET_PRICING)
  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Post()
  async setPricing(@Body() dto: SetPricingDto): Promise<Pricing> {
    return this.pricingService.setPricing(dto);
  }
}
