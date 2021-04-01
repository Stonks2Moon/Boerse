import { Controller, Get, Render } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  @ApiExcludeEndpoint(true)
  @Get()
  @Render('index.hbs')
  renderIndex() {
    // no op
  }

  @ApiExcludeEndpoint(true)
  @Get('trading')
  @Render('trading.hbs')
  renderTrading() {
    // no op
  }
}
