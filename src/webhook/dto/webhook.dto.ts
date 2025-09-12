import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsObject,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderInfoDto {
  @IsNotEmpty()
  @IsString()
  order_id: string;

  @IsNotEmpty()
  @IsNumber()
  order_amount: number;

  @IsNotEmpty()
  @IsNumber()
  transaction_amount: number;

  @IsNotEmpty()
  @IsString()
  gateway: string;

  @IsNotEmpty()
  @IsString()
  bank_reference: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsString()
  payment_mode: string;

  @IsNotEmpty()
  @IsString()
  payemnt_details: string;

  @IsNotEmpty()
  @IsString()
  Payment_message: string;

  @IsNotEmpty()
  @IsDateString()
  payment_time: string;

  @IsString()
  error_message: string;
}

export class WebhookDto {
  @IsNotEmpty()
  @IsNumber()
  status: number;

  @ValidateNested()
  @Type(() => OrderInfoDto)
  @IsObject()
  order_info: OrderInfoDto;
}
