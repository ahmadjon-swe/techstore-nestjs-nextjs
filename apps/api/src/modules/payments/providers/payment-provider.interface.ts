export interface PaymentInitResult {
  checkoutUrl?: string;
  providerRef?: string;
}

export interface PaymentProvider {
  initiate(orderId: string, amountUzs: bigint): Promise<PaymentInitResult>;
  verifyCallback(payload: Record<string, unknown>): Promise<{ orderId: string; success: boolean; providerRef: string }>;
}
