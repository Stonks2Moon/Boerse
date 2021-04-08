import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MSBroker } from 'src/broker/broker.decorator';
import { BrokerModel } from 'src/broker/models/Broker.model';
import { ClearingService } from './clearing.service';

@ApiTags('Clearing')
@Controller('clearing')
export class ClearingController {
  constructor(private readonly clearingService: ClearingService) {}

  @Get('report/:timestamp')
  async getClearingReport(
    @MSBroker() broker: BrokerModel,
    @Param('timestamp') timestamp: string,
  ): Promise<any> {
    return this.clearingService.getReport(broker.id, timestamp);
  }

  @Get('')
  async getClearingReport_(): Promise<any> {
    return this.clearingService.getReport(
      '60477379c18e3513f4a2e4c6',
      '1617872645189',
    );
  }
}
