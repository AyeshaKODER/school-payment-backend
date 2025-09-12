import { Controller, Post, Body, UseGuards, ValidationPipe, Get, Param, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';   // ✅ use our custom guard
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payment')
@UseGuards(JwtAuthGuard)   // ✅ ensures only logged-in users can hit these
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // 1️⃣ Create Payment
  @Post('create-payment')
  async createPayment(@Body(ValidationPipe) createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  // 2️⃣ Check Payment Status
  @Get('status/:id')
  async checkStatus(@Param('id') id: string) {
    return this.paymentService.checkPaymentStatus(id);
  }

  // 3️⃣ Webhook (PG will call this)
  @Post('webhook')
  async webhook(@Req() req: any) {
    return this.paymentService.handleWebhook(req.body);
  }
}
