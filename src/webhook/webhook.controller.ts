import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';

import { WebhookService } from './webhook.service';
import { WebhookDto } from './dto/webhook.dto';

@Controller('webhook')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(@Body(ValidationPipe) webhookDto: WebhookDto) {
    return this.webhookService.processWebhook(webhookDto);
  }
}
