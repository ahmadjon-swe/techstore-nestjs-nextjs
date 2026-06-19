import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OtpType } from '@techstore/db';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpService } from '../otp/otp.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private otp: OtpService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.phone && !dto.email) throw new BadRequestException('Phone or email required');
    if (dto.confirmPassword !== undefined && dto.confirmPassword !== dto.password) {
      throw new BadRequestException('Passwords do not match');
    }

    const existing = await this.prisma.user.findFirst({
      where: dto.email ? { email: dto.email } : { phone: dto.phone },
    });
    if (existing) throw new ConflictException('User already exists');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { phone: dto.phone, email: dto.email, passwordHash, name: dto.name },
    });

    // Send welcome verification OTP if email + SMTP configured (non-blocking)
    if (dto.email && this.otp.isEmailEnabled()) {
      const code = await this.otp.createOtp(user.id, OtpType.EMAIL_VERIFY);
      void this.otp.sendOtp(dto.email, code, OtpType.EMAIL_VERIFY);
    }

    return this.issueTokens(user.id, user.role);
  }

  /** Always returns { sent } to avoid leaking which accounts exist. */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ sent: boolean }> {
    if (!dto.email && !dto.phone) throw new BadRequestException('Phone or email required');
    if (!this.otp.isEmailEnabled()) {
      throw new BadRequestException('Password reset by email is not available — contact support');
    }

    const user = await this.prisma.user.findFirst({
      where: { deletedAt: null, ...(dto.email ? { email: dto.email } : { phone: dto.phone }) },
    });
    if (user && user.email) {
      const code = await this.otp.createOtp(user.id, OtpType.PASSWORD_RESET);
      await this.otp.sendOtp(user.email, code, OtpType.PASSWORD_RESET);
    }
    return { sent: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { deletedAt: null, ...(dto.email ? { email: dto.email } : { phone: dto.phone }) },
    });
    if (!user) throw new BadRequestException('Invalid code');

    const ok = await this.otp.verifyOtp(user.id, dto.code, OtpType.PASSWORD_RESET);
    if (!ok) throw new BadRequestException('Invalid or expired code');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    // Invalidate all sessions on password reset
    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    return this.issueTokens(user.id, user.role);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.passwordHash) {
      // OAuth-only account setting a password for the first time
      const passwordHash = await bcrypt.hash(dto.newPassword, 12);
      await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
      return { success: true };
    }
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { success: true };
  }

  async login(dto: LoginDto) {
    if (!dto.phone && !dto.email) throw new BadRequestException('Phone or email required');

    const user = await this.prisma.user.findFirst({
      where: { deletedAt: null, ...(dto.email ? { email: dto.email } : { phone: dto.phone }) },
    });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.role);
  }

  async refresh(token: string) {
    const hash = this.hashToken(token);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash: hash } });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedException('Refresh token expired or invalid');
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: stored.userId } });
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.issueTokens(user.id, user.role);
  }

  async googleLogin(profile: { googleId: string; email?: string; name?: string }) {
    let user = await this.prisma.user.findUnique({ where: { googleId: profile.googleId } });

    if (!user && profile.email) {
      user = await this.prisma.user.findUnique({ where: { email: profile.email } });
    }

    if (user) {
      if (!user.googleId) {
        await this.prisma.user.update({ where: { id: user.id }, data: { googleId: profile.googleId } });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          googleId: profile.googleId,
          email: profile.email,
          name: profile.name,
        },
      });
    }

    return this.issueTokens(user.id, user.role);
  }

  async logout(token: string) {
    const hash = this.hashToken(token);
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash: hash } });
  }

  private async issueTokens(userId: string, role: string) {
    const accessToken = this.jwt.sign(
      { sub: userId, role },
      {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_TTL', '15m'),
      },
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTtl = this.config.get<string>('JWT_REFRESH_TTL', '30d');

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + this.parseTtlToMs(refreshTtl)),
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseTtlToMs(ttl: string): number {
    const unit = ttl.slice(-1);
    const value = parseInt(ttl.slice(0, -1), 10);
    const map: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    return value * (map[unit] ?? 86_400_000);
  }
}
