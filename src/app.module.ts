import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb://localhost:27017/school-payment'), // your DB URI
    AuthModule, // ← MUST import AuthModule here
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
