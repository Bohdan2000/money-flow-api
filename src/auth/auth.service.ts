import * as crypto from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const ACCESS_TOKEN_EXPIRES_IN_SEC = 900; // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
    });
    return this.tokenResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const valid = await this.usersService.validatePassword(user, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');
    return this.tokenResponse(user);
  }

  async loginWithGoogle(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email)
      throw new UnauthorizedException('Invalid Google token');

    let user = await this.usersService.findByGoogleId(payload.sub);
    if (!user) {
      const existingByEmail = await this.usersService.findByEmail(
        payload.email,
      );
      if (existingByEmail) {
        user = await this.usersService.setGoogleId(
          existingByEmail._id,
          payload.sub,
        );
      } else {
        user = await this.usersService.create({
          email: payload.email,
          googleId: payload.sub,
          name: payload.name ?? payload.email,
        });
      }
    }
    return this.tokenResponse(user);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findByIdOrThrow(userId);
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const stored = await this.refreshTokenModel.findOne({ tokenHash });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.usersService.findById(stored.userId);
    if (!user) throw new UnauthorizedException('User not found');

    // Rotate: delete old refresh token and issue new one
    await this.refreshTokenModel.deleteOne({ _id: stored._id });
    const tokens = await this.buildTokenResponse(user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresIn: tokens.accessTokenExpiresIn,
    };
  }

  async tokenResponse(user: UserDocument) {
    return this.buildTokenResponse(user);
  }

  private async buildTokenResponse(user: UserDocument) {
    const payload = { sub: user._id.toString(), email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SEC,
    });
    const { token: refreshToken, tokenHash } = this.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    await this.refreshTokenModel.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN_SEC,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    };
  }

  private generateRefreshToken(): { token: string; tokenHash: string } {
    const token = crypto.randomBytes(32).toString('hex');
    return { token, tokenHash: this.hashRefreshToken(token) };
  }

  private hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
