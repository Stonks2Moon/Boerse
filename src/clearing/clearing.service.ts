import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { Response } from 'express';
import { Model } from 'mongoose';
import { Broker } from 'src/broker/schemas/Broker.schema';
import { InvoiceService } from 'src/invoice/invoice.service';
import { Pricing } from 'src/pricing/schemas/Pricing.schema';
import { Clearing } from './schemas/Clearing.schema';
import { DailyClearing } from './schemas/DailyClearing.schema';
const xl = require('excel4node');

@Injectable()
export class ClearingService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly invoiceService: InvoiceService,
    @InjectModel(Clearing.name) private clearingModel: Model<Clearing>,
    @InjectModel(Broker.name) private brokerModel: Model<Broker>,
    @InjectModel(Pricing.name) private pricingModel: Model<Pricing>,
    @InjectModel(DailyClearing.name)
    private dailyClearingModel: Model<DailyClearing>,
  ) {
    try {
      this.schedulerRegistry.getCronJob('daily-clearing');
    } catch (_) {
      this.dailyClearing();
    }
  }

  @Cron('0 0 1 * * *', { name: 'daily-clearing' })
  public async dailyClearing() {
    console.log('Daily clearing');
    const date = new Date();
    const funcs = ['setHours', 'setSeconds', 'setMinutes', 'setMilliseconds'];
    funcs.forEach((x) => date[x](0));

    const upperEnd = date.getTime() - 1;
    const lowerEnd = upperEnd - 1000 * 60 * 60 * 24 + 1;

    const brokers = await this.brokerModel.find({
      type: { $in: ['private', 'business', 'liquiditydonor'] },
    });
    const brokerIds = brokers.map((x) => x._id + '');

    brokerIds.forEach(async (brokerId) => {
      const brokerType = brokers.filter((x) => x._id + '' == brokerId)[0].type;
      const filter = {
        brokerId: brokerId,
        $and: [
          { timestamp: { $gte: lowerEnd } },
          { timestamp: { $lte: upperEnd } },
        ],
      };

      const total = await this.clearingModel.find(filter).countDocuments();
      if (total > 0) {
        const aggr = await this.clearingModel
          .aggregate()
          .match(filter)
          .project({
            emits: {
              key: '$brokerId',
              value: {
                volume: { $multiply: ['$amount', '$price'] },
                type: '$type',
              },
            },
          })
          .group({
            _id: '$emits.value.type',
            volume: { $sum: '$emits.value.volume' },
          })
          .project({ _id: 0, type: '$_id', volume: '$volume' });

        const sellVolume =
          aggr.filter((x) => x.type === 'sell').map((x) => x.volume)[0] || 0;
        const buyVolume =
          aggr.filter((x) => x.type === 'buy').map((x) => x.volume)[0] || 0;
        const totalChangeover = buyVolume + sellVolume;

        const pricingModel = await this.pricingModel.findOne({
          type: brokerType,
        });

        if (pricingModel) {
          let pricing = pricingModel.entries
            .sort((a, b) => a.changeoverLimit - b.changeoverLimit)
            .filter((x) => totalChangeover <= x.changeoverLimit)[0];

          if (!pricing)
            pricing = pricingModel.entries[pricingModel.entries.length - 1];

          let transactionFee =
            pricing.transactionPromille * (totalChangeover / 1000);
          if (transactionFee < pricing.transactionMin)
            transactionFee = pricing.transactionMin;
          if (transactionFee > pricing.transactionMax)
            transactionFee = pricing.transactionMax;

          let tradeFee = pricing.tradePromille * (totalChangeover / 1000);
          if (tradeFee < pricing.tradeMin) tradeFee = pricing.tradeMin;
          if (tradeFee > pricing.tradeMax) tradeFee = pricing.tradeMax;

          const month = date.getMonth() + 1;
          const year = date.getFullYear();

          await this.dailyClearingModel.create({
            brokerId: brokerId,
            orderAmount: total,
            volumeBuy: buyVolume,
            volumeSell: sellVolume,
            transactionPrice: transactionFee,
            tradePrice: tradeFee,
            fixum: pricing.fixum,
            day: date.getDate(),
            month: month,
            year: year,
          });

          const d = date.toISOString().split('T')[0];
          const charge = transactionFee + tradeFee + pricing.fixum;
          this.invoiceService.addInvoice(
            brokerId,
            charge,
            month,
            year,
            'Gebühren der Börse vom ' + d,
          );
          this.invoiceService.addInvoice(
            brokerId,
            buyVolume,
            month,
            year,
            'Kauf Volumen vom ' + d,
          );
          this.invoiceService.addInvoice(
            brokerId,
            -sellVolume,
            month,
            year,
            'Verkauf Volumen vom ' + d,
          );

          await this.clearingModel.deleteMany(filter);
        }
      }
    });
  }

  async getReport(brokerId: string, timestamp: string): Promise<any> {
    if (isNaN(+timestamp)) {
      throw new UnprocessableEntityException('Invalid timestamp');
    }

    const now = new Date();
    const date = new Date(+timestamp);

    const funcs = ['setHours', 'setSeconds', 'setMinutes', 'setMilliseconds'];
    funcs.forEach((x) => {
      now[x](0);
      date[x](0);
    });

    if (date.getTime() > now.getTime()) {
      throw new UnprocessableEntityException(
        'Given timestamp cant be in the future',
      );
    }

    if (now.getTime() === date.getTime()) {
      throw new UnprocessableEntityException(
        'Cant calculate report for current day. Day is not over',
      );
    }

    const lowerEnd = date.getTime();
    const upperEnd = lowerEnd + 1000 * 60 * 60 * 24;

    this.invoiceService.addInvoice(
      brokerId,
      date.getMonth() + 1,
      date.getFullYear(),
      100,
      'Manuell erstellter Clearing Report vom ' + date.toISOString(),
    );

    const aggr = await this.clearingModel
      .aggregate()
      .match({
        brokerId: brokerId,
        $and: [
          { timestamp: { $gte: lowerEnd } },
          { timestamp: { $lte: upperEnd } },
        ],
      })
      .project({
        emits: {
          key: '$brokerId',
          value: {
            volume: { $multiply: ['$amount', '$price'] },
            type: '$type',
          },
        },
      })
      .group({
        _id: '$emits.value.type',
        volume: { $sum: '$emits.value.volume' },
      })
      .project({ _id: 0, type: '$_id', volume: '$volume' });

    const price = aggr
      .map((x) => {
        if (x.type === 'sell') return x.volume;
        else return -x.volume;
      })
      .reduce((a, b) => a + b, 0);

    return price;
  }

  public async getMonthlyReport(
    brokerId: string,
    month: string | number,
    year: string | number,
    res: Response,
  ) {
    if (isNaN(+month)) {
      throw new UnprocessableEntityException('Invalid month');
    }
    month = +month;
    if (month < 1 || month > 12) {
      throw new UnprocessableEntityException('Invalid month');
    }

    if (isNaN(+year)) {
      throw new UnprocessableEntityException('Invalid year');
    }
    year = +year;

    if (year < 2021 || year > 2100) {
      throw new UnprocessableEntityException('Invalid year');
    }

    const wb = new xl.Workbook({
      author: 'MoonStonks Boerse',
      defaultFont: { name: 'Arial' },
    });

    const ws = wb.addWorksheet('Clearing_für_' + month + '/' + year);

    const dailyClearings = await this.dailyClearingModel.find({
      brokerId: brokerId,
      month: month,
      year: year,
    });

    ws.cell(1, 1).string('Clearing für ' + month + '/' + year);

    let x = 4;
    ws.cell(3, 1).string('Datum');
    ws.cell(3, 2).string('Order Amount');
    ws.cell(3, 3).string('Kauf Volumen');
    ws.cell(3, 4).string('Verkauf Volumen');
    ws.cell(3, 5).string('Transaktionspreis');
    ws.cell(3, 6).string('Handelspreis');
    ws.cell(3, 7).string('Fixum');
    ws.cell(3, 8).string('Saldo');

    dailyClearings.forEach((c, i) => {
      ws.cell(x, 1).string(`${c.day || ''}.${c.month}.${c.year}`);
      ws.cell(x, 2).number(c.orderAmount);
      ws.cell(x, 3).number(c.volumeBuy);
      ws.cell(x, 4).number(c.volumeSell);
      ws.cell(x, 5).number(c.transactionPrice);
      ws.cell(x, 6).number(c.tradePrice);
      ws.cell(x, 7).number(c.fixum);
      ws.cell(x, 8).number(
        c.volumeSell -
          (c.volumeBuy + c.transactionPrice + c.tradePrice + c.fixum),
      );
      x++;
    });

    if (res) {
      wb.write('Clearing Report.xlsx', res);
    }
  }

  public async getAllDailyClearings(): Promise<DailyClearing[]> {
    return this.dailyClearingModel.find();
  }
}
