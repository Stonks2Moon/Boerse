import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Price } from './schemas/Price.schema';
import { Share } from './schemas/Share.schema';
import { ShareService } from './share.service';

@ApiTags('Share')
@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @ApiResponse({
    description:
      'Returns an array with all tradeable shares and their current prices.',
  })
  @Get('')
  async getAvailableShares(): Promise<Share[]> {
    return this.shareService.getAvailableShares();
  }

  @ApiResponse({
    description:
      "The current price of a given share. Price will be null if share with id 'shareId' doesn't exist.",
  })
  @Get('price/:id')
  async getCurrentPrice(@Param('id') id: string): Promise<number | null> {
    return this.shareService.getCurrentPrice(id);
  }

  @ApiResponse({
    description:
      "Returns a list of prices of a given share. List will be empty if share with id 'shareId' doesn't exist or the price list is empty.",
  })
  @Get('prices/:id')
  async getPrices(
    @Param('id') id: string,
    @Query('from') from?: number,
    @Query('until') until?: number,
  ): Promise<Price[] | null> {
    return this.shareService.getPrices(id, from, until);
  }
}
