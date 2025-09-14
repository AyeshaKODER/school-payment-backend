import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  getHello: any;
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth() {
    return { message: 'Backend is working 🚀' };
  }
}
