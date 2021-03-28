import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  renderIndex() {
    // no op
  }

  @Get('pricing')
  @Render('pricing')
  renderPricing() {
    // no op
  }

  @Get('trading')
  @Render('trading')
  renderTrading() {
    // no op
  }
}
