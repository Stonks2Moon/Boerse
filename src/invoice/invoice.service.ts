import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice } from './schemas/Invoice.schema';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
  ) {}

  public async addInvoice(
    brokerId: string,
    amount: number,
    description?: string,
  ) {
    this.invoiceModel.create({
      brokerId: brokerId,
      amount: amount,
      description: description,
      payed: false,
    });
  }
}
