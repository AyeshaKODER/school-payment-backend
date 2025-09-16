import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  @Get()
  getRoot(): { message: string } {
    return { message: 'Backend is running ✅' };
  }

  @Get('health')
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'Healthy ✅',
      timestamp: new Date().toISOString(),
    };
  }
}
