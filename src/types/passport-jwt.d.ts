declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export interface JwtFromRequestFunction {
    (req: any): string | null;
  }

  export interface StrategyOptions {
    jwtFromRequest: JwtFromRequestFunction;
    secretOrKey: string;
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
  }

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: (payload: any, done: (error: any, user?: any) => void) => void);
  }

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): JwtFromRequestFunction;
    fromHeader(header_name: string): JwtFromRequestFunction;
    fromBodyField(field_name: string): JwtFromRequestFunction;
  };
}
