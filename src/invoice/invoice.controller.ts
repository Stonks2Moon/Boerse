import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MSBroker } from 'src/broker/broker.decorator';
import { BrokerTypeGuard, BrokerTypes } from 'src/broker/brokerType.guard';
import { BrokerModel } from 'src/broker/models/Broker.model';
import { InvoiceService } from './invoice.service';
import { Invoice } from './schemas/Invoice.schema';

@ApiTags('Invoice')
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getInvoices(@MSBroker() broker: BrokerModel): Promise<Invoice[]> {
    return this.invoiceService.getInvoices(broker.id);
  }

  @ApiBearerAuth()
  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Get("all")
  async getAll(): Promise<Invoice[]> {
    return this.invoiceService.getAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('pay')
  async payInvoice(
    @MSBroker() broker: BrokerModel,
    @Body() body: { invoiceId: string },
  ): Promise<boolean> {
    return this.invoiceService.payInvoice(broker.id, body.invoiceId);
  }
}
