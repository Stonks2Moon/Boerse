import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { MSBroker } from 'src/broker/broker.decorator';
import { BrokerModel } from 'src/broker/models/Broker.model';
import { ClearingService } from './clearing.service';

@ApiTags('Clearing')
@Controller('clearing')
export class ClearingController {
  constructor(private readonly clearingService: ClearingService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('report/:timestamp')
  async getClearingReport(
    @MSBroker() broker: BrokerModel,
    @Param('timestamp') timestamp: string,
  ): Promise<any> {
    return this.clearingService.getReport(broker.id, timestamp);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':month/:year')
  async getMonthlyClearing(
    @MSBroker() broker: BrokerModel,
    @Param('month') month: string,
    @Param('year') year: string,
    @Res() res: Response,
  ) {
    this.clearingService.getMonthlyReport(broker.id, month, year, res);
  }
}
