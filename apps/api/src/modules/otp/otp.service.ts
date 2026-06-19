import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { OtpType } from '@techstore/db';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    const host = config.get('SMTP_HOST');
    const user = config.get('SMTP_USER');
    const pass = config.get('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: config.get<number>('SMTP_PORT', 587),
        secure: false,
        auth: { user, pass },
      });
      this.logger.log('SMTP mailer ready');
    } else {
      this.logger.warn('SMTP not configured — OTP emails disabled');
    }
  }

  isEmailEnabled() { return !!this.transporter; }

  private generate() {
    return String(crypto.randomInt(100000, 999999));
  }

  async createOtp(userId: string, type: OtpType): Promise<string> {
    // Invalidate previous unused codes of same type
    await this.prisma.otpCode.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: new Date() },
    });

    const code = this.generate();
    await this.prisma.otpCode.create({
      data: {
        userId,
        code,
        type,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      },
    });
    return code;
  }

  async verifyOtp(userId: string, code: string, type: OtpType): Promise<boolean> {
    const otp = await this.prisma.otpCode.findFirst({
      where: { userId, code, type, usedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!otp) return false;
    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
    return true;
  }

  async sendOtp(to: string, code: string, type: OtpType): Promise<void> {
    if (!this.transporter) return;
    const subjects: Record<OtpType, string> = {
      EMAIL_VERIFY: 'Verify your TechStore account',
      PASSWORD_RESET: 'Reset your TechStore password',
      PHONE_VERIFY: 'Verify your phone number',
    };
    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM', 'TechStore <noreply@techstore.uz>'),
      to,
      subject: subjects[type],
      html: `<div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#6e8bff">TechStore</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing:8px;color:#06070b;background:#f5f5f5;padding:16px;border-radius:8px;text-align:center">${code}</h1>
        <p style="color:#888;font-size:12px">Expires in 10 minutes. Don't share this code.</p>
      </div>`,
    }).catch((err) => this.logger.error('Email send failed', err));
  }
}
