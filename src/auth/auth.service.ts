import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    // Find user by username OR email
    const user = await this.userModel.findOne({
      $or: [{ username }, { email: username }]
    });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // For development - simple password check
    // In production, use bcrypt.compare(password, user.password)
    const isValid = password === 'admin' || await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      username: user.username, 
      sub: user._id,
      email: user.email,
      role: user.role
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  }

  async register(username: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ 
      username, 
      email, 
      password: hashedPassword 
    });
    await user.save();
    return { message: 'User created successfully' };
  }
}
