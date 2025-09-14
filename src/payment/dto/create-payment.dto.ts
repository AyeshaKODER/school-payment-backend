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
  name!: string; // <-- added !

  @IsNotEmpty()
  @IsString()
  id!: string; // <-- added !

  @IsNotEmpty()
  @IsEmail()
  email!: string; // <-- added !
}

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  school_id!: string; // <-- added !

  @IsNotEmpty()
  @IsString()
  trustee_id!: string; // <-- added !

  @ValidateNested()
  @Type(() => StudentInfoDto)
  @IsObject()
  student_info!: StudentInfoDto; // <-- added !

  @IsNotEmpty()
  @IsString()
  gateway_name!: string; // <-- added !

  @IsNotEmpty()
  @IsNumber()
  order_amount!: number; // <-- added !

  @IsNotEmpty()
  @IsString()
  payment_mode!: string; // <-- added !
}
