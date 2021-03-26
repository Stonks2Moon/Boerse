import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BrokerTypeGuard, BrokerTypes } from 'src/broker/brokerType.guard';
import { CreateShareDto } from './dtos/CreateShare.dto';
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

  @ApiQuery({
    name: 'from',
    required: false,
    description: 'TODO:',
  })
  @ApiQuery({
    name: 'until',
    required: false,
    description: 'TODO:',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'TODO:',
  })
  @ApiResponse({
    description:
      "Returns a list of prices of a given share. List will be empty if share with id 'shareId' doesn't exist or the price list is empty.",
  })
  @Get('prices/:id')
  async getPrices(
    @Param('id') id: string,
    @Query('from') from?: number,
    @Query('until') until?: number,
    @Query('limit') limit?: number,
  ): Promise<Price[] | null> {
    return this.shareService.getPrices(id, +from, +until, +limit);
  }

  @ApiBearerAuth()
  @ApiResponse({
    description: 'Returns the newly created share.',
  })
  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Post('')
  async createShare(@Body() dto: CreateShareDto): Promise<Share> {
    return this.shareService.createShare(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({
    description: 'Returns the patched share.',
  })
  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Patch(':id')
  async patchShare(
    @Param('id') id: string,
    @Body() dto: CreateShareDto,
  ): Promise<Share> {
    return this.shareService.patchShare(id, dto);
  }
}
