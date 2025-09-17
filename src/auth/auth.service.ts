// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, LoginDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    const { username, email, password } = createUserDto;
    this.logger.log(`Registration attempt for username: ${username}`);

    const existingUser = await this.userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) throw new ConflictException('Username already exists');
      if (existingUser.email === email) throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new this.userModel({ username, email, password: hashedPassword, role: 'user', isActive: true });
    const savedUser = await user.save();
    this.logger.log(`User registered successfully with ID: ${savedUser._id}`);

    const payload = { username: savedUser.username, sub: savedUser._id, role: savedUser.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user: { id: savedUser._id.toString(), username: savedUser.username, email: savedUser.email, role: savedUser.role } };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { username, password } = loginDto;
    this.logger.log(`Login attempt for username: ${username}`);

    const user = await this.userModel.findOne({ $or: [{ username }, { email: username }] }).exec();
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account has been disabled');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { username: user.username, sub: user._id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user: { id: user._id.toString(), username: user.username, email: user.email, role: user.role } };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).select('-password').exec();
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) throw new UnauthorizedException('Current password is incorrect');

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await this.userModel.findByIdAndUpdate(userId, { password: hashedNewPassword });
    this.logger.log(`Password changed successfully for user: ${userId}`);

    return { message: 'Password changed successfully' };
  }

  async getUserProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password').exec();
    if (!user) throw new UnauthorizedException('User not found');

    return { id: user._id, username: user.username, email: user.email, role: user.role, isActive: user.isActive, createdAt: (user as any).createdAt, updatedAt: (user as any).updatedAt };
  }
}
