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

  /**
   * Returns all broker
   * @returns all broker
   */
  public async getBroker(): Promise<Broker[]> {
    return await this.brokerModel.find();
  }

  /**
   * Deletes existing broker
   * @param brokerId id of broker to remove
   * @returns true
   */
  public async removeBroker(brokerId: string): Promise<boolean> {
    if (!brokerId || !isValidObjectId(brokerId)) return false;
    await this.brokerModel.findOneAndDelete({ _id: brokerId });
    return true;
  }

  /**
   * Creates new Broker including JWT
   * @param dto CreateBrokerDto
   * @returns created broker
   */
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

  /**
   * Patches broker with given id
   * @param brokerId id of broker
   * @param dto CreateBrokerDto
   * @returns broker
   */
  public async patchBroker(
    brokerId: string,
    dto: CreateBrokerDto,
  ): Promise<Broker> {
    if (!brokerId || !isValidObjectId(brokerId)) {
      throw new UnprocessableEntityException('Invalid brokerId');
    }
    dto = BrokerValidator.validate(dto, ['stockmarket']);

    if (!(await this.brokerModel.findOne({ _id: brokerId }))) {
      throw new UnprocessableEntityException("Broker doesn't exist");
    }

    const jwt = this.jwtService.sign({ id: brokerId, ...dto });
    await this.brokerModel.updateOne(
      { _id: brokerId },
      { $set: { ...dto, token: jwt } },
    );

    return this.brokerModel.findOne({ _id: brokerId });
  }

  /**
   * Bans or unbans broker with given id
   * @param brokerId id of broker to toggle ban
   * @param banned is broker banned?
   * @returns broker
   */
  public async toggleBanned(
    brokerId: string,
    banned: boolean,
  ): Promise<Broker> {
    if (!brokerId || !isValidObjectId(brokerId)) {
      throw new UnprocessableEntityException('Invalid brokerId');
    }

    if (banned) {
      await this.brokerModel.updateOne(
        { _id: brokerId },
        { $set: { banned: true } },
      );
    } else {
      await this.brokerModel.updateOne(
        { _id: brokerId },
        { $unset: { banned: true } },
      );
    }

    return this.brokerModel.findOne({ _id: brokerId });
  }
}
