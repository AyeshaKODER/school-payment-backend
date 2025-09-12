import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEmail,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StudentInfoDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  school_id: string;

  @IsNotEmpty()
  @IsString()
  trustee_id: string;

  @ValidateNested()
  @Type(() => StudentInfoDto)
  @IsObject()
  student_info: StudentInfoDto;

  @IsNotEmpty()
  @IsString()
  gateway_name: string;

  @IsNotEmpty()
  @IsNumber()
  order_amount: number;

  @IsNotEmpty()
  @IsString()
  payment_mode: string;
}
