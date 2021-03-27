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
import {
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BrokerTypeGuard, BrokerTypes } from 'src/broker/brokerType.guard';
import { CreateShareDto } from './dtos/CreateShare.dto';
import { Price } from './schemas/Price.schema';
import { Share } from './schemas/Share.schema';
import { ShareService } from './share.service';
import {
  PARAM_SHARE_ID,
  QUERY_FROM_TS,
  QUERY_LIMIT,
  QUERY_UNTIL_TS,
  RESPONSE_AVAILABLE_SHARES,
  RESPONSE_CREATE_SHARE,
  RESPONSE_CURRENT_PRICE,
  RESPONSE_PATCH_SHARE,
  RESPONSE_PRICES,
} from './Share.swagger';

@ApiTags('Share')
@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @ApiResponse(RESPONSE_AVAILABLE_SHARES)
  @Get()
  async getAvailableShares(): Promise<Share[]> {
    return this.shareService.getAvailableShares();
  }

  @ApiParam(PARAM_SHARE_ID)
  @ApiResponse(RESPONSE_CURRENT_PRICE)
  @Get('price/:id')
  async getCurrentPrice(@Param('id') id: string): Promise<number | null> {
    return this.shareService.getCurrentPrice(id);
  }

  @ApiParam(PARAM_SHARE_ID)
  @ApiQuery(QUERY_FROM_TS)
  @ApiQuery(QUERY_UNTIL_TS)
  @ApiQuery(QUERY_LIMIT)
  @ApiResponse(RESPONSE_PRICES)
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
  @ApiResponse(RESPONSE_CREATE_SHARE)
  @BrokerTypes(['stockmarket'])
  @UseGuards(AuthGuard('jwt'), BrokerTypeGuard)
  @Post()
  async createShare(@Body() dto: CreateShareDto): Promise<Share> {
    return this.shareService.createShare(dto);
  }

  @ApiBearerAuth()
  @ApiResponse(RESPONSE_PATCH_SHARE)
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
