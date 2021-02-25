import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Broker } from './schemas/Broker.schema';

@Injectable()
export class BrokerService {
  constructor(@InjectModel(Broker.name) private brokerModel: Model<Broker>) {}
}
