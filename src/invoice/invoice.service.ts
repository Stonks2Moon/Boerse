import { Injectable, UnprocessableEntityException } from '@nestjs/common';
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
    month: number,
    year: number,
    description?: string,
  ) {
    amount = Math.ceil(amount * 100) / 100;

    this.invoiceModel
      .create({
        brokerId: brokerId,
        amount: amount,
        description: description,
        month: month,
        year: year,
        payed: false,
        timestamp: Date.now(),
      })
      .then(() => {});
  }

  public async getInvoices(brokerId: string): Promise<Invoice[]> {
    return this.invoiceModel.find({ brokerId: brokerId, payed: false });
  }

  public async payInvoice(
    brokerId: string,
    invoiceId: string,
  ): Promise<boolean> {
    const invoice = await this.invoiceModel.findOne({
      _id: invoiceId,
      brokerId: brokerId,
    });
    if (!invoice) {
      throw new UnprocessableEntityException("Invoice doens't exist");
    }

    if (invoice.payed) {
      throw new UnprocessableEntityException('Invoice has already been payed');
    }

    await invoice.update({ $set: { payed: true } });

    return true;
  }
}
