import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentProvider, PaymentInitResult } from './payment-provider.interface';

@Injectable()
export class ClickProvider implements PaymentProvider {
  private readonly logger = new Logger(ClickProvider.name);
  private readonly merchantId: string;
  private readonly serviceId: string;
  private readonly secret: string;

  constructor(private config: ConfigService) {
    this.merchantId = config.get<string>('CLICK_MERCHANT_ID', '');
    this.serviceId = config.get<string>('CLICK_SERVICE_ID', '');
    this.secret = config.get<string>('CLICK_SECRET', '');
  }

  async initiate(orderId: string, amountUzs: bigint): Promise<PaymentInitResult> {
    const amount = Number(amountUzs);
    const checkoutUrl =
      `https://my.click.uz/services/pay?service_id=${this.serviceId}` +
      `&merchant_id=${this.merchantId}&amount=${amount}&transaction_param=${orderId}`;
    return { checkoutUrl };
  }

  async verifyCallback(payload: Record<string, unknown>) {
    const orderId = String(payload['merchant_trans_id'] ?? '');
    const providerRef = String(payload['click_trans_id'] ?? '');
    const signTime = String(payload['sign_time'] ?? '');
    const signString = String(payload['sign_string'] ?? '');

    const hash = crypto
      .createHash('md5')
      .update(`${providerRef}${this.serviceId}${this.secret}${orderId}${signTime}`)
      .digest('hex');

    const success = hash === signString && payload['error'] === '0';
    if (!success) this.logger.warn(`Click sig mismatch for order ${orderId}`);
    return { orderId, success, providerRef };
  }
}
