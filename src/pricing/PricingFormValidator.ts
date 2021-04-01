import { UnprocessableEntityException } from '@nestjs/common';
import { SetPricingDto } from './dtos/SetPricing.dto';

export class PricingFormValidator {
  private static thr(message: string): void {
    throw new UnprocessableEntityException(message);
  }

  private static checkNumb(
    key: string,
    numb: number,
    min: number,
    max?: number,
  ): number {
    if (!numb) {
      this.thr(key + ' muss gesetzt sein.');
    }
    numb = +numb;
    if (isNaN(numb)) {
      this.thr(key + ' muss eine Zahl sein.');
    }
    if (numb < min) {
      this.thr(key + ' darf nicht kleiner als ' + min + ' sein.');
    }
    if (max && numb > max) {
      this.thr(key + ' darf nicht größer als ' + max + ' sein.');
    }
    return numb;
  }

  public static validate(dto: SetPricingDto): SetPricingDto {
    let { entries, type } = dto;

    if (!type || type.length === 0) {
      this.thr('Ungültiger Pricing Typ.');
    }

    if (!entries || entries.length === 0) {
      this.thr('Entries müssen gesetzt und mehr als null sein');
    }

    entries = entries.map((e) => {
      return {
        changeoverLimit: this.checkNumb(
          'changeoverLimit',
          e.changeoverLimit,
          0,
        ),
        fixum: this.checkNumb('fixum', e.fixum, 0),
        tradePromille: this.checkNumb('tradePromille', e.tradePromille, 0),
        tradeMin: this.checkNumb('tradeMin', e.tradeMin, 0, e.tradeMax),
        tradeMax: this.checkNumb('tradeMax', e.tradeMax, e.tradeMin),
        transactionMin: this.checkNumb(
          'transactionMin',
          e.transactionMin,
          0,
          e.transactionMax,
        ),
        transactionMax: this.checkNumb(
          'transactionMax',
          e.transactionMax,
          e.transactionMin,
        ),
        transactionPromille: this.checkNumb(
          'transactionPromille',
          e.transactionPromille,
          0,
        ),
      };
    });

    return {
      entries: entries,
      type: type,
    };
  }
}
