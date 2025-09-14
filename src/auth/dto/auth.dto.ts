import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  username!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;
}

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class AuthResponseDto {
  access_token!: string;
  user!: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refresh_token!: string;
}
