import { UnprocessableEntityException } from '@nestjs/common';
import { CreateBrokerDto } from './dtos/CreateBroker.dto';

export class BrokerValidator {
  public static validate(dto: CreateBrokerDto, eT = []): CreateBrokerDto {
    const { displayName, type } = dto;

    if (!displayName || displayName.length < 5) {
      throw new UnprocessableEntityException(
        'Please provide a display name with a minimum length of 5',
      );
    }

    if (!type || type.length < 4) {
      throw new UnprocessableEntityException('Please provide a broker type');
    }

    if (!['business', 'private', 'simulation', ...eT].includes(type)) {
      throw new UnprocessableEntityException(
        'Invalid broker type. Valid types are: business, private, simulation',
      );
    }

    return { displayName: dto.displayName, type: dto.type };
  }
}
