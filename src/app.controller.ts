import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot(): { message: string } {
    return { message: 'School Payment API is running 🚀' };
  }

  @Get('health')
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'Healthy ✅',
      timestamp: new Date().toISOString(),
    };
  }
}
