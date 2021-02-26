import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClearingService } from './clearing.service';

@ApiTags('Clearing')
@Controller('clearing')
export class ClearingController {
  constructor(private readonly clearingService: ClearingService) {}
}
