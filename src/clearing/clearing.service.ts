import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { InvoiceService } from 'src/invoice/invoice.service';
import { Clearing } from './schemas/Clearing.schema';

@Injectable()
export class ClearingService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly invoiceService: InvoiceService,
    @InjectModel(Clearing.name) private clearingModel: Model<Clearing>,
  ) {
    try {
      this.schedulerRegistry.getCronJob('daily-clearing');
    } catch (_) {
      this.dailyClearing();
    }
  }

  @Cron('0 0 1 * * *', { name: 'daily-clearing' })
  public dailyClearing() {
    console.log('Daily clearing');
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
}
