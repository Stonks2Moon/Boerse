import { Injectable } from '@nestjs/common';

export type MarketStatus = 'open' | 'closed';

@Injectable()
export class MarketService {
  // TODO: Database entry
  public status: MarketStatus = 'open';

  public async isOpen(): Promise<boolean> {
    return (await this.getStatus()) === 'open';
  }

  public async isClosed(): Promise<boolean> {
    return !(await this.isOpen());
  }

  public async getStatus(): Promise<MarketStatus> {
    return this.status;
  }

  public async setStatus(status: MarketStatus): Promise<boolean> {
    this.status = status;
    return true;
  }

  public async openMarket(): Promise<boolean> {
    await this.setStatus('open');
    return true;
  }

  public async closeMarket(): Promise<boolean> {
    await this.setStatus('closed');
    return true;
  }
}
