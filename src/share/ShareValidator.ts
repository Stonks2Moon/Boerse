import {
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { CreateShareDto } from './dtos/CreateShare.dto';

export class ShareValidator {
  public static validate(dto: CreateShareDto): CreateShareDto {
    const { color, name, price, thumbnail } = dto;
    if (!color || color.length < 3 || !color.startsWith('#')) {
      throw new UnprocessableEntityException('Please provide a valid color');
    }
    if (!name || name.length < 3) {
      throw new UnprocessableEntityException('Please provide a valid name');
    }
    if (!price || typeof price !== 'number' || price < 0) {
      throw new UnsupportedMediaTypeException('Please provide a valid price');
    }
    if (
      !thumbnail ||
      thumbnail.length === 0 ||
      !thumbnail.startsWith('https')
    ) {
      throw new UnprocessableEntityException(
        'Please provide a valid thumbnail',
      );
    }

    return {
      color: dto.color,
      name: dto.name,
      price: dto.price,
      thumbnail: dto.thumbnail,
    };
  }
}
