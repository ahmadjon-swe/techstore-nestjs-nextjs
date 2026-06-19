import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider, PaymentInitResult } from './payment-provider.interface';

// Payme uses UZS tiyin (1 UZS = 100 tiyin) for API amounts
@Injectable()
export class PaymeProvider implements PaymentProvider {
  private readonly logger = new Logger(PaymeProvider.name);
  private readonly merchantId: string;
  private readonly key: string;

  constructor(private config: ConfigService) {
    this.merchantId = config.get<string>('PAYME_MERCHANT_ID', '');
    this.key = config.get<string>('PAYME_KEY', '');
  }

  async initiate(orderId: string, amountUzs: bigint): Promise<PaymentInitResult> {
    const amountTiyin = amountUzs * 100n;
    const params = Buffer.from(
      JSON.stringify({ m: this.merchantId, ac: { order_id: orderId }, a: amountTiyin.toString() }),
    ).toString('base64');
    const checkoutUrl = `https://checkout.paycom.uz/${params}`;
    return { checkoutUrl };
  }

  async verifyCallback(payload: Record<string, unknown>) {
    const { method, params } = payload as { method: string; params: Record<string, unknown> };
    const account = params?.account as Record<string, string> | undefined;
    const orderId = account?.order_id ?? '';
    const providerRef = (params?.id as string | undefined) ?? '';

    const authHeader = (payload['_auth'] as string | undefined) ?? '';
    const expected = `Basic ${Buffer.from(`Paycom:${this.key}`).toString('base64')}`;
    if (authHeader !== expected) {
      this.logger.warn(`Payme auth mismatch for order ${orderId}`);
      return { orderId, success: false, providerRef };
    }

    const success = method === 'PerformTransaction';
    return { orderId, success, providerRef };
  }
}
