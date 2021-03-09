import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { BrokerValidator } from './BrokerValidator';
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
    await this.brokerModel.findOneAndDelete({ _id: id });
    return true;
  }

  public async createBroker(dto: CreateBrokerDto): Promise<Broker> {
    dto = BrokerValidator.validate(dto);

    const broker = await this.brokerModel.create({
      ...dto,
      token: 'unset',
    });

    const jwt = this.jwtService.sign({ id: broker._id, ...dto });
    broker.token = jwt;

    await this.brokerModel.updateOne(
      { _id: broker.id },
      { $set: { token: jwt } },
    );

    return broker;
  }

  public async patchBroker(id: string, dto: CreateBrokerDto): Promise<Broker> {
    if (!id || !isValidObjectId(id)) {
      throw new UnprocessableEntityException('Invalid brokerId');
    }
    dto = BrokerValidator.validate(dto, ['stockmarket']);

    if (!(await this.brokerModel.findOne({ _id: id }))) {
      throw new UnprocessableEntityException("Broker doesn't exist");
    }

    const jwt = this.jwtService.sign({ id: id, ...dto });
    await this.brokerModel.updateOne(
      { _id: id },
      { $set: { ...dto, token: jwt } },
    );

    return this.brokerModel.findOne({ _id: id });
  }

  public async toggleBanned(id: string, banned: boolean): Promise<Broker> {
    if (!id || !isValidObjectId(id)) {
      throw new UnprocessableEntityException('Invalid brokerId');
    }

    if (banned) {
      await this.brokerModel.updateOne({ _id: id }, { $set: { banned: true } });
    } else {
      await this.brokerModel.updateOne(
        { _id: id },
        { $unset: { banned: true } },
      );
    }

    return this.brokerModel.findOne({ _id: id });
  }
}
