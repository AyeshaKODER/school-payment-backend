import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    // Simple login logic
    const user = await this.userModel.findOne({ username });
    if (user && user.password === password) {
      const payload = { username: user.username, sub: user._id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    return null;
  }

  async register(username: string, email: string, password: string) {
    const user = new this.userModel({ username, email, password });
    await user.save();
    return { message: 'User created successfully' };
  }
  // auth.service.ts
async validateUser(userId: string): Promise<User | null> {
  return this.userModel.findById(userId).select('-password').exec();
}

}