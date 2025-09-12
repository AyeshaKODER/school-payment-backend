import {
  Controller,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payment')
@UseGuards(AuthGuard('jwt'))
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-payment')
  async createPayment(
    @Body(ValidationPipe) createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(createPaymentDto);
  }
}
