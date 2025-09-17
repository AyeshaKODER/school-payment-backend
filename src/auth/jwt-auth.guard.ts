import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard
 * 
 * This guard automatically uses the JwtStrategy defined in auth module.
 * It validates the JWT token from Authorization header and attaches
 * the decoded payload to request.user.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
