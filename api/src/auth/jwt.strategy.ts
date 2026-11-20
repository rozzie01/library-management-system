import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not set in .env');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // read "Authorization: Bearer <token>"
      secretOrKey: secret,                                      // check the stamp with the secret
    });
  }

  // Runs only after the token's signature is valid. The result becomes req.user.
  validate(payload: { sub: number; role: string }) {
    return { userId: payload.sub, role: payload.role };
  }
}