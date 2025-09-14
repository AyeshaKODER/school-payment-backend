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
  order_id!: string;

  @IsNotEmpty()
  @IsNumber()
  order_amount!: number;

  @IsNotEmpty()
  @IsNumber()
  transaction_amount!: number;

  @IsNotEmpty()
  @IsString()
  gateway!: string;

  @IsNotEmpty()
  @IsString()
  bank_reference!: string;

  @IsNotEmpty()
  @IsString()
  status!: string;

  @IsNotEmpty()
  @IsString()
  payment_mode!: string;

  @IsNotEmpty()
  @IsString()
  payment_details!: string; // Fixed typo

  @IsNotEmpty()
  @IsString()
  payment_message!: string; // Fixed typo

  @IsNotEmpty()
  @IsDateString()
  payment_time!: string;

  @IsString()
  error_message?: string; // optional
}

export class WebhookDto {
  @IsNotEmpty()
  @IsNumber()
  status!: number;

  @ValidateNested()
  @Type(() => OrderInfoDto)
  @IsObject()
  order_info!: OrderInfoDto;
}
