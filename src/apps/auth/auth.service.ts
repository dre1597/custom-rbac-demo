import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/models/user.model';
import { JwtPayload } from './types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async verifyRefreshToken(id: string, refreshToken: string) {
    const user = await this.userService.findByPkWithRelations(id);

    if (!user || !user.refreshToken.compareToken(refreshToken)) {
      throw new UnauthorizedException('Invalid refresh token or credentials');
    }

    return user;
  }

  async login(dto: LoginDto) {
    const { username, password } = dto;
    const user = await this.userService.validateUser(username, password);
    const { token, refreshToken } = await this.generateTokens(user);

    return {
      token,
      refreshToken,
      user: this.formatUserPayload(user),
    };
  }

  async loginViaRefreshToken(user: Partial<User>) {
    const { token, refreshToken } = await this.generateTokens(user);

    return {
      token,
      refreshToken,
      user: this.formatUserPayload(user),
    };
  }

  private async generateTokens(user: Partial<User>) {
    const payload = this.formatUserPayload(user);

    const token = this.generateJwtToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    return {
      token,
      refreshToken,
    };
  }

  private generateJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('auth.jwtExpiresIn'),
      secret: this.configService.get('auth.jwtSecret'),
    });
  }

  private async generateRefreshToken(payload: JwtPayload) {
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('auth.jwtRefreshExpiresIn'),
      secret: this.configService.get('auth.jwtRefreshSecret'),
    });

    await this.userService.updateRefreshToken(payload.id, refreshToken);

    return refreshToken;
  }

  private formatUserPayload(user: Partial<User>) {
    return {
      id: user.id,
      username: user.username,
    };
  }
}
