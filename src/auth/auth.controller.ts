import { Controller, Post, Get, Body, ValidationPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser, JwtPayload } from './user.decorator';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(ValidationPipe) body: { username: string; email: string; password: string }) {
    return this.authService.register(body.username, body.email, body.password);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) body: { username: string; password: string }) {
    return this.authService.login(body.username, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@GetUser() user: JwtPayload) {
    return this.authService.getUserProfile(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate-token')
  async validateToken(@GetUser() user: JwtPayload) {
    return { 
      valid: true, 
      user: {
        id: user.sub,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }
  @Public()
  @Get('test')
  test() {
    return { message: 'Auth controller is working!' };
  }
}
