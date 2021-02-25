import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Clearing } from './schemas/Clearing.schema';

@Injectable()
export class ClearingService {
  constructor(
    @InjectModel(Clearing.name) private ClearingModel: Model<Clearing>,
  ) {}
}
