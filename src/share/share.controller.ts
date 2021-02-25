import { Controller, Get, Param } from '@nestjs/common';
import { IShare } from './interfaces/IShare.interface';
import { ShareService } from './share.service';

@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Get('')
  async getAvailableShares(): Promise<IShare[]> {
    return this.shareService.getAvailableShares();
  }

  @Get('price/:id')
  async getCurrentPrice(@Param('id') id: string): Promise<number> {
    return this.shareService.getCurrentPrice(id);
  }
}
