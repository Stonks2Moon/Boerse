import { Controller } from '@nestjs/common';
import { ClearingService } from './clearing.service';

@Controller('clearing')
export class ClearingController {
  constructor(private readonly clearingService: ClearingService) {}
}
