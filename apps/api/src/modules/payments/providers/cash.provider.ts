import { Injectable } from '@nestjs/common';
import { PaymentProvider, PaymentInitResult } from './payment-provider.interface';

@Injectable()
export class CashProvider implements PaymentProvider {
  async initiate(_orderId: string, _amountUzs: bigint): Promise<PaymentInitResult> {
    return {};
  }

  async verifyCallback(_payload: Record<string, unknown>) {
    return { orderId: '', success: false, providerRef: '' };
  }
}
