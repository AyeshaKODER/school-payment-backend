import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from './schemas/user.schema';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    // ConfigModule should be global, already imported in AppModule
    ConfigModule,
    
    // Mongoose schema for users
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    
    // Passport JWT setup
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // JwtModule setup
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'defaultSecret',
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [
    AuthService,
    JwtStrategy,
    MongooseModule, // Exported in case other modules need User model
  ],
})
export class AuthModule {}
