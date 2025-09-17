import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './user.decorator';
import type { JwtPayload } from './user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ User Registration
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  // ✅ User Login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(new ValidationPipe()) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ✅ Protected Test Route
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtected() {
    return { message: 'This is a protected route ✅' };
  }

  // ✅ Get logged-in user profile
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser() user: JwtPayload) {
    return this.authService.getUserProfile(user.sub);
  }

  // ✅ Change Password
  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @GetUser() user: JwtPayload,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(user.sub, body.oldPassword, body.newPassword);
  }

  // ✅ Logout (just a dummy response; JWT invalidation not implemented here)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@GetUser() user: JwtPayload) {
    return { message: 'Logged out successfully', timestamp: new Date().toISOString() };
  }

  // ✅ Validate Token
  @Get('validate-token')
  @UseGuards(JwtAuthGuard)
  async validateToken(@GetUser() user: JwtPayload) {
    return {
      valid: true,
      user: {
        id: user.sub,
        username: user.username,
        role: user.role || 'user',
      },
    };
  }
}
