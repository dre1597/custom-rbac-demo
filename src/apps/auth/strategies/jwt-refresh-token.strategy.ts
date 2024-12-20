import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request as RequestExpress } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('auth.jwtRefreshSecret'),
      passReqToCallback: true,
    });
  }

  async validate(request: RequestExpress) {
    const refreshToken = request
      .get('Authorization')
      .replace('Bearer', '')
      .trim();

    const jwtDecoded = this.jwtService.decode(refreshToken);

    if (jwtDecoded['exp'] < new Date().getTime() / 1000) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.authService.verifyRefreshToken(
      jwtDecoded['id'],
      refreshToken,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
