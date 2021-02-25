import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Clearing } from 'src/clearing/schemas/Clearing.schema';
import { Share } from 'src/share/schemas/Share.schema';
import { Order } from './schemas/Order.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Share.name) private shareModel: Model<Share>,
    @InjectModel(Clearing.name) private clearingModel: Model<Clearing>,
  ) {}
}
