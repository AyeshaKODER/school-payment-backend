import {
  Controller,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payment')
@UseGuards(AuthGuard('jwt'))
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // 1️ Create Payment
  @Post('create-payment')
  async createPayment(
    @Body(ValidationPipe) createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  // 2️ Check Payment Status
  @Get('status/:id')
  async checkStatus(@Param('id') id: string) {
    return this.paymentService.checkPaymentStatus(id);
  }

  // 3️ Webhook (PG will call this)
  @Post('webhook')
  async webhook(@Req() req: any) {
    return this.paymentService.handleWebhook(req.body);
  }
}
