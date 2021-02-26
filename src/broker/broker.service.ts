import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateBrokerDto } from './dtos/CreateBroker.dto';
import { Broker } from './schemas/Broker.schema';

@Injectable()
export class BrokerService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Broker.name) private brokerModel: Model<Broker>,
  ) {}

  public async getBroker(): Promise<Broker[]> {
    return await this.brokerModel.find();
  }

  public async removeBroker(id: string): Promise<boolean> {
    if (!id || !isValidObjectId(id)) return false;
    await this.brokerModel.findByIdAndDelete(id);
    return true;
  }

  public async createBroker(create: CreateBrokerDto): Promise<Broker> {
    const { displayName, type } = create;

    if (!displayName || displayName.length === 0) {
      throw new UnprocessableEntityException(
        'Please provide a valid displayName',
      );
    }

    if (
      !type ||
      !(type === 'business' || type === 'private' || type === 'simulation')
    ) {
      throw new UnprocessableEntityException('Please provide a valid type');
    }

    create = { displayName: displayName, type: type };
    const jwt = this.jwtService.sign(create);
    const broker = await this.brokerModel.create({
      ...create,
      token: jwt,
    });

    return broker;
  }
}
