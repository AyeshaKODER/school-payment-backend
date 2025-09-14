import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Body, 
  ValidationPipe, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './user.decorator';
import type { JwtPayload } from './user.decorator';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtected() {
    return { message: 'This is a protected route ✅' };
  }


  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser() user: JwtPayload) {
    return this.authService.getUserProfile(user.sub);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @GetUser() user: JwtPayload,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      user.sub,
      body.oldPassword,
      body.newPassword,
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@GetUser() user: JwtPayload) {
    // In a more advanced implementation, you would:
    // 1. Add token to blacklist
    // 2. Clear refresh tokens from database
    // 3. Log the logout event
    
    return { 
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    };
  }

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