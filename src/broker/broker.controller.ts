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
import { BrokerService } from './broker.service';
import { BrokerTypeGuard, BrokerTypes } from './brokerType.guard';
import { CreateBrokerDto } from './dtos/CreateBroker.dto';
import { Broker } from './schemas/Broker.schema';

@ApiTags('Broker')
@Controller('broker')
export class BrokerController {
  constructor(private readonly brokerService: BrokerService) {}

  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Get('')
  async getBroker(): Promise<Broker[]> {
    return this.brokerService.getBroker();
  }

  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Post('')
  async createBroker(@Body() createBroker: CreateBrokerDto): Promise<Broker> {
    return this.brokerService.createBroker(createBroker);
  }

  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Delete(':id')
  async removeBroker(@Param('id') id: string): Promise<boolean> {
    return this.brokerService.removeBroker(id);
  }

  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Post('verify/stockmarket')
  async verfiyStockmarket(): Promise<boolean> {
    return true;
  }
}
