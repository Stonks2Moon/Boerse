import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BrokerService } from './broker.service';
import { BrokerTypeGuard, BrokerTypes } from './brokerType.guard';
import { CreateBrokerDto } from './dtos/CreateBroker.dto';
import { Broker } from './schemas/Broker.schema';

@ApiBearerAuth()
@ApiTags('Broker')
@Controller('broker')
export class BrokerController {
  constructor(private readonly brokerService: BrokerService) {}

  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Get()
  async getBroker(): Promise<Broker[]> {
    return this.brokerService.getBroker();
  }

  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Post()
  async createBroker(@Body() dto: CreateBrokerDto): Promise<Broker> {
    return this.brokerService.createBroker(dto);
  }

  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Delete(':brokerId')
  async removeBroker(@Param('brokerId') brokerId: string): Promise<boolean> {
    return this.brokerService.removeBroker(brokerId);
  }
  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Patch(':brokerId/banned/:banned')
  async toggleBanned(
    @Param('brokerId') brokerId: string,
    @Param('banned') b: number,
  ): Promise<Broker> {
    return this.brokerService.toggleBanned(brokerId, b && +b === 1);
  }

  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Patch(':brokerId')
  async updateBroker(
    @Param('brokerId') brokerId: string,
    @Body() dto: CreateBrokerDto,
  ): Promise<Broker> {
    return this.brokerService.patchBroker(brokerId, dto);
  }

  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Post('verify/stockmarket')
  async verfiyStockmarket(): Promise<boolean> {
    return true;
  }
}
